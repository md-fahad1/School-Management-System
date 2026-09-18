import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamInput, UpdateExamInput } from './dto/exam.dto';
import { AuditService, AuditAction } from '../audit/audit.service';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class ExamsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(user: RequestUser, skip = 0, take = 10) {
    // Row-level visibility: admins see everything, teachers see only
    // exams tied to lessons they teach, students/parents see only
    // exams for their own (or their child's) class.
    const where = await this.visibilityFilter(user);
    return this.prisma.exam.findMany({
      where,
      skip,
      take,
      orderBy: { startTime: 'desc' },
      include: { lesson: { include: { subject: true, class: true, teacher: true } } },
    });
  }

  async findOne(id: string, user?: RequestUser) {
    const where = user ? { id, ...(await this.visibilityFilter(user)) } : { id };
    const exam = await this.prisma.exam.findFirst({
      where,
      include: { lesson: { include: { subject: true, class: true, teacher: true } } },
    });
    if (!exam) throw new NotFoundException(`Exam ${id} not found`);
    return exam;
  }

  async create(input: CreateExamInput, actorId?: string) {
    const created = await this.prisma.exam.create({
      data: {
        title: input.title,
        fullMarks: input.fullMarks ?? 100,
        passMarks: input.passMarks ?? 33,
        startTime: input.startTime,
        endTime: input.endTime,
        lessonId: input.lessonId,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.EXAM_CREATE,
      success: true,
      metadata: { examId: created.id, title: created.title },
    });

    return created;
  }

  async update(id: string, input: UpdateExamInput, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.exam.update({ where: { id }, data: input });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.EXAM_UPDATE,
      success: true,
      metadata: {
        examId: id,
        before: { title: before.title, fullMarks: before.fullMarks },
        after: { title: updated.title, fullMarks: updated.fullMarks },
      },
    });

    return updated;
  }

  async remove(id: string, actorId?: string) {
    const exam = await this.findOne(id);
    await this.prisma.exam.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.EXAM_DELETE,
      success: true,
      metadata: { examId: id, title: exam.title },
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
