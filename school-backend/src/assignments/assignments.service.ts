import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentInput, UpdateAssignmentInput } from './dto/assignment.dto';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

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

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { lesson: { include: { subject: true, class: true, teacher: true } } },
    });
    if (!assignment) throw new NotFoundException(`Assignment ${id} not found`);
    return assignment;
  }

  create(input: CreateAssignmentInput) {
    return this.prisma.assignment.create({
      data: {
        title: input.title,
        startDate: input.startDate,
        dueDate: input.dueDate,
        lessonId: input.lessonId,
      },
    });
  }

  async update(id: string, input: UpdateAssignmentInput) {
    await this.findOne(id);
    return this.prisma.assignment.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.assignment.delete({ where: { id } });
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
