import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResultInput, UpdateResultInput } from './dto/result.dto';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: RequestUser, skip = 0, take = 10) {
    const where = await this.visibilityFilter(user);
    return this.prisma.result.findMany({
      where,
      skip,
      take,
      include: {
        student: true,
        exam: { include: { lesson: { include: { subject: true, class: true, teacher: true } } } },
        assignment: {
          include: { lesson: { include: { subject: true, class: true, teacher: true } } },
        },
      },
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.result.findUnique({
      where: { id },
      include: {
        student: true,
        exam: { include: { lesson: { include: { subject: true, class: true, teacher: true } } } },
        assignment: {
          include: { lesson: { include: { subject: true, class: true, teacher: true } } },
        },
      },
    });
    if (!result) throw new NotFoundException(`Result ${id} not found`);
    return result;
  }

  create(input: CreateResultInput) {
    this.assertExactlyOneParent(input);
    return this.prisma.result.create({ data: input });
  }

  async update(id: string, input: UpdateResultInput) {
    await this.findOne(id);
    if (input.examId !== undefined || input.assignmentId !== undefined) {
      this.assertExactlyOneParent(input as CreateResultInput);
    }
    return this.prisma.result.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.result.delete({ where: { id } });
    return true;
  }

  private assertExactlyOneParent(input: { examId?: string; assignmentId?: string }) {
    const hasExam = Boolean(input.examId);
    const hasAssignment = Boolean(input.assignmentId);
    if (hasExam === hasAssignment) {
      throw new BadRequestException('A result must link to exactly one of examId or assignmentId');
    }
  }

  private async visibilityFilter(user: RequestUser) {
    if (user.role === Role.ADMIN) return {};

    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: user.id } });
      return {
        OR: [
          { exam: { lesson: { teacherId: teacher?.id } } },
          { assignment: { lesson: { teacherId: teacher?.id } } },
        ],
      };
    }

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
      return { studentId: student?.id };
    }

    if (user.role === Role.PARENT) {
      const parent = await this.prisma.parent.findUnique({
        where: { userId: user.id },
        include: { students: true },
      });
      const studentIds = parent?.students.map((s) => s.id) ?? [];
      return { studentId: { in: studentIds } };
    }

    return { id: 'no-match' };
  }
}
