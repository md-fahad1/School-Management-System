import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeStructureInput, UpdateFeeStructureInput } from './dto/fee-structure.dto';
import { GenerateInvoiceInput, GenerateBulkInvoicesInput } from './dto/invoice.dto';
import { RecordPaymentInput } from './dto/payment.dto';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  // ---- Fee Structures ----

  findAllFeeStructures(gradeId?: string) {
    return this.prisma.feeStructure.findMany({
      where: gradeId ? { gradeId } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOneFeeStructure(id: string) {
    const fs = await this.prisma.feeStructure.findUnique({ where: { id } });
    if (!fs) throw new NotFoundException(`Fee structure ${id} not found`);
    return fs;
  }

  async createFeeStructure(input: CreateFeeStructureInput) {
    const existing = await this.prisma.feeStructure.findUnique({
      where: { name_gradeId: { name: input.name, gradeId: input.gradeId } },
    });
    if (existing) {
      throw new BadRequestException(
        `A "${input.name}" fee structure already exists for this grade`,
      );
    }
    return this.prisma.feeStructure.create({ data: input });
  }

  async updateFeeStructure(id: string, input: UpdateFeeStructureInput) {
    await this.findOneFeeStructure(id);
    return this.prisma.feeStructure.update({ where: { id }, data: input });
  }

  async removeFeeStructure(id: string) {
    await this.findOneFeeStructure(id);
    const inUse = await this.prisma.invoice.count({ where: { feeStructureId: id } });
    if (inUse > 0) {
      throw new BadRequestException(
        'Cannot delete a fee structure that already has invoices linked to it',
      );
    }
    await this.prisma.feeStructure.delete({ where: { id } });
    return true;
  }

  // ---- Invoices ----

  async findAllInvoices(
    user: RequestUser,
    skip = 0,
    take = 20,
    status?: PaymentStatus,
    studentId?: string,
  ) {
    const visibility = await this.visibilityFilter(user);
    const where = {
      ...visibility,
      ...(status ? { status } : {}),
      ...(studentId ? { studentId } : {}),
    };
    const invoices = await this.prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { dueDate: 'desc' },
      include: { student: true, feeStructure: true },
    });
    return invoices.map((inv) => this.withComputedFields(inv));
  }

  async findOneInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { student: true, feeStructure: true, payments: { include: { receivedBy: true } } },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return this.withComputedFields(invoice);
  }

  async generateInvoice(input: GenerateInvoiceInput) {
    const student = await this.prisma.student.findUnique({ where: { id: input.studentId } });
    if (!student) throw new NotFoundException(`Student ${input.studentId} not found`);

    let amount = input.amount;
    if (input.feeStructureId) {
      const fs = await this.findOneFeeStructure(input.feeStructureId);
      amount = amount ?? fs.amount;
    }
    if (amount === undefined) {
      throw new BadRequestException('Provide either an amount or a feeStructureId to derive it from');
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        studentId: input.studentId,
        feeStructureId: input.feeStructureId,
        period: input.period,
        amount,
        dueDate: new Date(input.dueDate),
      },
      include: { student: true, feeStructure: true },
    });
    return this.withComputedFields(invoice);
  }

  async generateBulkInvoices(input: GenerateBulkInvoicesInput) {
    const feeStructure = await this.findOneFeeStructure(input.feeStructureId);
    const students = await this.prisma.student.findMany({
      where: { gradeId: input.gradeId },
      select: { id: true },
    });
    if (students.length === 0) {
      throw new BadRequestException('No students found in this grade');
    }

    // Skip students who already have an invoice for this exact fee structure + period
    // so re-running the same bulk job is safe (idempotent-ish).
    const existing = await this.prisma.invoice.findMany({
      where: {
        feeStructureId: input.feeStructureId,
        period: input.period,
        studentId: { in: students.map((s) => s.id) },
      },
      select: { studentId: true },
    });
    const alreadyInvoiced = new Set(existing.map((e) => e.studentId));
    const toCreate = students.filter((s) => !alreadyInvoiced.has(s.id));

    if (toCreate.length === 0) {
      return { created: 0, skipped: students.length };
    }

    await this.prisma.invoice.createMany({
      data: toCreate.map((s) => ({
        studentId: s.id,
        feeStructureId: feeStructure.id,
        period: input.period,
        amount: feeStructure.amount,
        dueDate: new Date(input.dueDate),
      })),
    });

    return { created: toCreate.length, skipped: alreadyInvoiced.size };
  }

  // ---- Payments ----

  async recordPayment(input: RecordPaymentInput, receivedById: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: input.invoiceId } });
      if (!invoice) throw new NotFoundException(`Invoice ${input.invoiceId} not found`);
      if (invoice.status === PaymentStatus.PAID) {
        throw new BadRequestException('This invoice is already fully paid');
      }
      if (invoice.status === PaymentStatus.CANCELLED) {
        throw new BadRequestException('Cannot record a payment against a cancelled invoice');
      }

      const balance = invoice.amount - invoice.amountPaid;
      if (input.amount > balance) {
        throw new BadRequestException(
          `Payment of ${input.amount} exceeds the remaining balance of ${balance}`,
        );
      }

      const payment = await tx.payment.create({
        data: {
          invoiceId: input.invoiceId,
          amount: input.amount,
          method: input.method,
          reference: input.reference,
          notes: input.notes,
          receivedById,
        },
      });

      const newAmountPaid = invoice.amountPaid + input.amount;
      const newStatus =
        newAmountPaid >= invoice.amount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

      await tx.invoice.update({
        where: { id: input.invoiceId },
        data: { amountPaid: newAmountPaid, status: newStatus },
      });

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: { receivedBy: true },
      });
    });
  }

  // ---- Reports ----

  async defaulters(gradeId?: string) {
    const now = new Date();
    // Flip anything past its due date and still unpaid over to OVERDUE first,
    // so the list (and the status shown elsewhere) stays accurate.
    await this.prisma.invoice.updateMany({
      where: {
        dueDate: { lt: now },
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
      },
      data: { status: PaymentStatus.OVERDUE },
    });

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: PaymentStatus.OVERDUE,
        ...(gradeId ? { student: { gradeId } } : {}),
      },
      orderBy: { dueDate: 'asc' },
      include: { student: true, feeStructure: true },
    });
    return invoices.map((inv) => this.withComputedFields(inv));
  }

  async collectionSummary(period?: string) {
    const where = period ? { period } : {};
    const invoices = await this.prisma.invoice.findMany({ where });

    const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
    const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);

    return {
      totalInvoiced,
      totalCollected,
      totalPending: totalInvoiced - totalCollected,
      invoiceCount: invoices.length,
      paidCount: invoices.filter((i) => i.status === PaymentStatus.PAID).length,
      overdueCount: invoices.filter((i) => i.status === PaymentStatus.OVERDUE).length,
    };
  }

  // ---- Helpers ----

  private withComputedFields(invoice: any) {
    return {
      ...invoice,
      balance: invoice.amount - invoice.amountPaid,
      studentName: invoice.student ? `${invoice.student.name} ${invoice.student.surname}` : undefined,
    };
  }

  private async visibilityFilter(user: RequestUser) {
    if (user.role === Role.ADMIN) return {};

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
      return { studentId: student?.id ?? 'no-match' };
    }

    if (user.role === Role.PARENT) {
      const parent = await this.prisma.parent.findUnique({
        where: { userId: user.id },
        include: { students: true },
      });
      const studentIds = parent?.students.map((s) => s.id) ?? [];
      return { studentId: { in: studentIds.length ? studentIds : ['no-match'] } };
    }

    // Teachers don't currently have a fee-visibility use case.
    return { id: 'no-match' };
  }
}