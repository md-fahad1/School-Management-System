import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { CreateDepartmentInput, UpdateDepartmentInput } from './dto/department.dto';
import { requireInstitutionId } from '../tenant/tenant-context';
@Injectable()
export class DepartmentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  findAll(search?: string) {
    return this.prisma.department.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
      include: { _count: { select: { classes: true } } },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { classes: true } } },
    });
    if (!department) throw new NotFoundException(`Department ${id} not found`);
    return department;
  }

  async create(input: CreateDepartmentInput, actorId?: string) {
    const existing = await this.prisma.department.findFirst({
      where: { name: { equals: input.name.trim(), mode: 'insensitive' } },
    });
    if (existing) throw new BadRequestException(`"${input.name}" already exists`);

    const created = await this.prisma.department.create({
      data: { ...input, name: input.name.trim(), institutionId: requireInstitutionId() },
    });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.DEPARTMENT_CREATE,
      success: true,
      metadata: { departmentId: created.id, name: created.name },
    });
    return created;
  }

  async update(id: string, input: UpdateDepartmentInput, actorId?: string) {
    await this.findOne(id);
    const updated = await this.prisma.department.update({ where: { id }, data: input });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.DEPARTMENT_UPDATE,
      success: true,
      metadata: { departmentId: id },
    });
    return updated;
  }

  async remove(id: string, actorId?: string) {
    const department = await this.findOne(id);
    if (department._count.classes > 0) {
      throw new BadRequestException(
        `Cannot delete: ${department._count.classes} class(es) still use this department`,
      );
    }
    await this.prisma.department.delete({ where: { id } });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.DEPARTMENT_DELETE,
      success: true,
      metadata: { departmentId: id, name: department.name },
    });
    return true;
  }
}