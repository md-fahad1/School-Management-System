import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassInput, UpdateClassInput } from './dto/class.dto';
import { AuditService, AuditAction } from '../audit/audit.service';
import { requireInstitutionId } from '../tenant/tenant-context';
@Injectable()
export class ClassesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  findAll(search?: string, skip = 0, take = 10) {
    return this.prisma.class.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: { grade: true, supervisor: true, department: true }
    });
  }

  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: { grade: true, supervisor: true, department: true }
    });
    if (!cls) throw new NotFoundException(`Class ${id} not found`);
    return cls;
  }

  async create(input: CreateClassInput, actorId?: string) {
    const created = await this.prisma.class.create({ data: { ...input, institutionId: requireInstitutionId() } });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.CLASS_CREATE,
      success: true,
      metadata: { classId: created.id, name: created.name },
    });

    return created;
  }

  async update(id: string, input: UpdateClassInput, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.class.update({ where: { id }, data: input });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.CLASS_UPDATE,
      success: true,
      metadata: {
        classId: id,
        before: { name: before.name, capacity: before.capacity },
        after: { name: updated.name, capacity: updated.capacity },
      },
    });

    return updated;
  }

  async remove(id: string, actorId?: string) {
    const cls = await this.findOne(id);
    await this.prisma.class.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.CLASS_DELETE,
      success: true,
      metadata: { classId: id, name: cls.name },
    });

    return true;
  }
}
