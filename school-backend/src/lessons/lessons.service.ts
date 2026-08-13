import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonInput, UpdateLessonInput } from './dto/lesson.dto';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: RequestUser, skip = 0, take = 10) {
    const where = await this.visibilityFilter(user);
    return this.prisma.lesson.findMany({
      where,
      skip,
      take,
      orderBy: { startTime: 'asc' },
      include: { subject: true, class: true, teacher: true },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { subject: true, class: true, teacher: true },
    });
    if (!lesson) throw new NotFoundException(`Lesson ${id} not found`);
    return lesson;
  }

  create(input: CreateLessonInput) {
    return this.prisma.lesson.create({ data: input });
  }

  async update(id: string, input: UpdateLessonInput) {
    await this.findOne(id);
    return this.prisma.lesson.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lesson.delete({ where: { id } });
    return true;
  }

  private async visibilityFilter(user: RequestUser) {
    if (user.role === Role.ADMIN) return {};

    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: user.id } });
      return { teacherId: teacher?.id };
    }

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
      return { classId: student?.classId };
    }

    if (user.role === Role.PARENT) {
      const parent = await this.prisma.parent.findUnique({
        where: { userId: user.id },
        include: { students: true },
      });
      const classIds = parent?.students.map((s) => s.classId) ?? [];
      return { classId: { in: classIds } };
    }

    return { id: 'no-match' };
  }
}
