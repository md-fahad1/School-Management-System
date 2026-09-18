import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentInput, UpdateAssignmentInput } from './dto/assignment.dto';
import { AuditService, AuditAction } from '../audit/audit.service';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class AssignmentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(user: RequestUser, skip = 0, take = 10) {
    const where = await this.visibilityFilter(user);
    return this.prisma.assignment.findMany({
      where,
      skip,
      take,
      orderBy: { dueDate: 'asc' },
      include: { lesson: { include: { subject: true, class: true, teacher: true } } },
    });
  }

  async findOne(id: string, user?: RequestUser) {
    const where = user ? { id, ...(await this.visibilityFilter(user)) } : { id };
    const assignment = await this.prisma.assignment.findFirst({
      where,
      include: { lesson: { include: { subject: true, class: true, teacher: true } } },
    });
    if (!assignment) throw new NotFoundException(`Assignment ${id} not found`);
    return assignment;
  }

  async create(input: CreateAssignmentInput, actorId?: string) {
    const created = await this.prisma.assignment.create({
      data: {
        title: input.title,
        fullMarks: input.fullMarks ?? 100,
        passMarks: input.passMarks ?? 33,
        startDate: input.startDate,
        dueDate: input.dueDate,
        lessonId: input.lessonId,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ASSIGNMENT_CREATE,
      success: true,
      metadata: { assignmentId: created.id, title: created.title },
    });

    return created;
  }

  async update(id: string, input: UpdateAssignmentInput, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.assignment.update({ where: { id }, data: input });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ASSIGNMENT_UPDATE,
      success: true,
      metadata: {
        assignmentId: id,
        before: { title: before.title, dueDate: before.dueDate },
        after: { title: updated.title, dueDate: updated.dueDate },
      },
    });

    return updated;
  }

  async remove(id: string, actorId?: string) {
    const assignment = await this.findOne(id);
    await this.prisma.assignment.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ASSIGNMENT_DELETE,
      success: true,
      metadata: { assignmentId: id, title: assignment.title },
    });

    return true;
  }

  private async visibilityFilter(user: RequestUser) {
    if (user.role === Role.ADMIN) return {};

    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: user.id } });
      return { lesson: { teacherId: teacher?.id } };
    }

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
      return { lesson: { classId: student?.classId } };
    }

    if (user.role === Role.PARENT) {
      const parent = await this.prisma.parent.findUnique({
        where: { userId: user.id },
        include: { students: true },
      });
      const classIds = parent?.students.map((s) => s.classId) ?? [];
      return { lesson: { classId: { in: classIds } } };
    }

    return { id: 'no-match' };
  }
}
