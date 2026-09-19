import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectInput, UpdateSubjectInput } from './dto/subject.dto';
import { AuditService, AuditAction } from '../audit/audit.service';
import { requireInstitutionId } from '../tenant/tenant-context';
@Injectable()
export class SubjectsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  findAll(search?: string, skip = 0, take = 10) {
    return this.prisma.subject.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: { teachers: true },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { teachers: true },
    });
    if (!subject) throw new NotFoundException(`Subject ${id} not found`);
    return subject;
  }

  async create(input: CreateSubjectInput, actorId?: string) {
    const created = await this.prisma.subject.create({
      data: {
        name: input.name,
        institutionId: requireInstitutionId(),
        teachers: input.teacherIds
          ? { connect: input.teacherIds.map((id) => ({ id })) }
          : undefined,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.SUBJECT_CREATE,
      success: true,
      metadata: { subjectId: created.id, name: created.name },
    });

    return created;
  }

  async update(id: string, input: UpdateSubjectInput, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.subject.update({
      where: { id },
      data: {
        name: input.name,
        teachers: input.teacherIds
          ? { set: input.teacherIds.map((id) => ({ id })) }
          : undefined,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.SUBJECT_UPDATE,
      success: true,
      metadata: { subjectId: id, before: before.name, after: updated.name },
    });

    return updated;
  }

  async remove(id: string, actorId?: string) {
    const subject = await this.findOne(id);
    await this.prisma.subject.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.SUBJECT_DELETE,
      success: true,
      metadata: { subjectId: id, name: subject.name },
    });

    return true;
  }
}
