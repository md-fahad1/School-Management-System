import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Role, DiscountType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeStructureInput, UpdateFeeStructureInput } from './dto/fee-structure.dto';
import { GenerateInvoiceInput, GenerateBulkInvoicesInput } from './dto/invoice.dto';
import { CreateScholarshipInput, UpdateScholarshipInput } from './dto/scholarship.dto';
import { ApplyDiscountInput, ApplyFineInput } from './dto/discount-fine.dto';
import { AuditService, AuditAction } from '../audit/audit.service';
import { RecordPaymentInput } from './dto/payment.dto';
import { requireInstitutionId } from '../tenant/tenant-context';
interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService, private auditService: AuditService,) {}

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
    return this.prisma.feeStructure.create({ data: { ...input, institutionId: requireInstitutionId() } });
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

  async findOneInvoice(id: string, user?: RequestUser) {
    const where = user ? { id, ...(await this.visibilityFilter(user)) } : { id };
    const invoice = await this.prisma.invoice.findFirst({
      where,
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

    const { discountAmount, reason } = await this.activeScholarshipDiscount(input.studentId, amount);

    const invoice = await this.prisma.invoice.create({
      data: {
        studentId: input.studentId,
        feeStructureId: input.feeStructureId,
        period: input.period,
        amount,
        discountAmount,
        discountReason: reason,
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

    const invoiceData = await Promise.all(
      toCreate.map(async (s) => {
        const { discountAmount, reason } = await this.activeScholarshipDiscount(s.id, feeStructure.amount);
        return {
          studentId: s.id,
          feeStructureId: feeStructure.id,
          period: input.period,
          amount: feeStructure.amount,
          discountAmount,
          discountReason: reason,
          dueDate: new Date(input.dueDate),
        };
      }),
    );

    await this.prisma.invoice.createMany({ data: invoiceData });

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

      const payableAmount = invoice.amount - invoice.discountAmount + invoice.fineAmount;
      const balance = payableAmount - invoice.amountPaid;
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
        newAmountPaid >= payableAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

      await tx.invoice.update({
        where: { id: input.invoiceId },
        data: { amountPaid: newAmountPaid, status: newStatus },
      });
            await this.auditService.log({
        userId: receivedById,
        action: AuditAction.PAYMENT_RECORDED,
        success: true,
        metadata: { invoiceId: input.invoiceId, amount: input.amount, method: input.method },
      });

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: { receivedBy: true },
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
    const payableAmount = invoice.amount - invoice.discountAmount + invoice.fineAmount;
    return {
      ...invoice,
      payableAmount,
      balance: payableAmount - invoice.amountPaid,
      studentName: invoice.student ? `${invoice.student.name} ${invoice.student.surname}` : undefined,
    };
  }

  private async visibilityFilter(user: RequestUser) {
    // Accountant manages fees/invoices for every student, same as Admin.
    if (user.role === Role.ADMIN || user.role === Role.ACCOUNTANT) return {};

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

  // ---- Scholarships ----

  async findScholarships(user: RequestUser, studentId?: string) {
    const visibility = await this.visibilityFilter(user);
    const where = { ...visibility, ...(studentId ? { studentId } : {}) };
    const scholarships = await this.prisma.scholarship.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { student: true },
    });
    return scholarships.map((s) => ({
      ...s,
      studentName: `${s.student.name} ${s.student.surname}`,
    }));
  }

  async createScholarship(input: CreateScholarshipInput) {
    const student = await this.prisma.student.findUnique({ where: { id: input.studentId } });
    if (!student) throw new NotFoundException(`Student ${input.studentId} not found`);

    return this.prisma.scholarship.create({
      data: {
        studentId: input.studentId,
        name: input.name,
        type: input.type,
        value: input.value,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        notes: input.notes,
      },
    });
  }

  async updateScholarship(id: string, input: UpdateScholarshipInput) {
    const existing = await this.prisma.scholarship.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Scholarship ${id} not found`);

    return this.prisma.scholarship.update({
      where: { id },
      data: {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      },
    });
  }

  async removeScholarship(id: string) {
    const existing = await this.prisma.scholarship.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Scholarship ${id} not found`);
    await this.prisma.scholarship.delete({ where: { id } });
    return true;
  }

  private async activeScholarshipDiscount(studentId: string, baseAmount: number) {
    const now = new Date();
    const scholarships = await this.prisma.scholarship.findMany({
      where: {
        studentId,
        active: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
    });

    if (scholarships.length === 0) return { discountAmount: 0, reason: undefined as string | undefined };

    let discountAmount = 0;
    const reasons: string[] = [];
    for (const s of scholarships) {
      const amt = s.type === DiscountType.PERCENTAGE ? (baseAmount * s.value) / 100 : s.value;
      discountAmount += amt;
      reasons.push(s.name);
    }
    discountAmount = Math.min(discountAmount, baseAmount);

    return { discountAmount, reason: reasons.length ? reasons.join(', ') : undefined };
  }

  // ---- Manual discount / fine on a single invoice ----

  async applyInvoiceDiscount(invoiceId: string, input: ApplyDiscountInput) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    if (invoice.status === PaymentStatus.PAID || invoice.status === PaymentStatus.CANCELLED) {
      throw new BadRequestException('Cannot change the discount on a paid or cancelled invoice');
    }

    const discountAmount =
      input.type === DiscountType.PERCENTAGE ? (invoice.amount * input.value) / 100 : input.value;

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        discountAmount: Math.min(discountAmount, invoice.amount),
        discountReason: input.reason,
      },
      include: { student: true, feeStructure: true },
    });
    return this.withComputedFields(updated);
  }

  async applyInvoiceFine(invoiceId: string, input: ApplyFineInput) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    if (invoice.status === PaymentStatus.PAID || invoice.status === PaymentStatus.CANCELLED) {
      throw new BadRequestException('Cannot fine a paid or cancelled invoice');
    }

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        fineAmount: input.amount,
        fineReason: input.reason,
      },
      include: { student: true, feeStructure: true },
    });
    return this.withComputedFields(updated);
  }
}