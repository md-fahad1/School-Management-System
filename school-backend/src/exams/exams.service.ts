import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamInput, UpdateExamInput } from './dto/exam.dto';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

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

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { lesson: { include: { subject: true, class: true, teacher: true } } },
    });
    if (!exam) throw new NotFoundException(`Exam ${id} not found`);
    return exam;
  }

  create(input: CreateExamInput) {
    return this.prisma.exam.create({
      data: {
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
        lessonId: input.lessonId,
      },
    });
  }

  async update(id: string, input: UpdateExamInput) {
    await this.findOne(id);
    return this.prisma.exam.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.exam.delete({ where: { id } });
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
