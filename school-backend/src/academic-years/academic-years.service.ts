import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import {
  CreateAcademicYearInput,
  CreateTermInput,
  UpdateAcademicYearInput,
} from './dto/academic-year.dto';
import { requireInstitutionId } from '../tenant/tenant-context';
const WITH_TERMS = { terms: { orderBy: { startDate: 'asc' as const } } };

function assertRange(start: Date, end: Date, label = 'End date') {
  if (end <= start) throw new BadRequestException(`${label} must be after start date`);
}

@Injectable()
export class AcademicYearsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  findAll() {
    return this.prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
      include: WITH_TERMS,
    });
  }

  findCurrent() {
    return this.prisma.academicYear.findFirst({
      where: { isCurrent: true },
      include: WITH_TERMS,
    });
  }

  async findOne(id: string) {
    const year = await this.prisma.academicYear.findUnique({
      where: { id },
      include: WITH_TERMS,
    });
    if (!year) throw new NotFoundException(`Academic year ${id} not found`);
    return year;
  }

  async create(input: CreateAcademicYearInput, actorId?: string) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    assertRange(startDate, endDate);

    const existing = await this.prisma.academicYear.findFirst({ where: { name: input.name } });
    if (existing) throw new BadRequestException(`Academic year "${input.name}" already exists`);

    const created = await this.prisma.$transaction(async (tx) => {
      if (input.isCurrent) {
        await tx.academicYear.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
      }
      return tx.academicYear.create({
         data: { name: input.name, startDate, endDate, isCurrent: !!input.isCurrent, institutionId: requireInstitutionId() },
        include: WITH_TERMS,
      });
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ACADEMIC_YEAR_CREATE,
      success: true,
      metadata: { academicYearId: created.id, name: created.name },
    });
    return created;
  }

  async update(id: string, input: UpdateAcademicYearInput, actorId?: string) {
    const before = await this.findOne(id);
    const startDate = input.startDate ? new Date(input.startDate) : before.startDate;
    const endDate = input.endDate ? new Date(input.endDate) : before.endDate;
    assertRange(startDate, endDate);

    const updated = await this.prisma.academicYear.update({
      where: { id },
      data: { name: input.name, startDate, endDate },
      include: WITH_TERMS,
    });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ACADEMIC_YEAR_UPDATE,
      success: true,
      metadata: { academicYearId: id },
    });
    return updated;
  }

  // Exactly one academic year is "current" per institution.
  async setCurrent(id: string, actorId?: string) {
    await this.findOne(id);
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.academicYear.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
      return tx.academicYear.update({
        where: { id },
        data: { isCurrent: true },
        include: WITH_TERMS,
      });
    });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ACADEMIC_YEAR_SET_CURRENT,
      success: true,
      metadata: { academicYearId: id, name: updated.name },
    });
    return updated;
  }

  async remove(id: string, actorId?: string) {
    const year = await this.findOne(id);
    if (year.isCurrent) {
      throw new BadRequestException('Cannot delete the current academic year');
    }
    await this.prisma.academicYear.delete({ where: { id } });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ACADEMIC_YEAR_DELETE,
      success: true,
      metadata: { academicYearId: id, name: year.name },
    });
    return true;
  }

  // ---- terms / semesters ----
  async addTerm(input: CreateTermInput) {
    const year = await this.findOne(input.academicYearId);
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    assertRange(startDate, endDate);
    if (startDate < year.startDate || endDate > year.endDate) {
      throw new BadRequestException('Term dates must fall inside the academic year');
    }
    return this.prisma.term.create({
      data: {
        academicYearId: year.id,
        name: input.name,
        type: input.type,
        startDate,
        endDate,
      },
    });
  }

  async removeTerm(id: string) {
    const term = await this.prisma.term.findUnique({ where: { id } });
    if (!term) throw new NotFoundException(`Term ${id} not found`);
    await this.prisma.term.delete({ where: { id } });
    return true;
  }
}