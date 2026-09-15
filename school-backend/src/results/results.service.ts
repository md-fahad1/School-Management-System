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

    async create(input: CreateResultInput) {
    this.assertExactlyOneParent(input);
    await this.assertScoreWithinFullMarks(input);
    return this.prisma.result.create({ data: input });
  }

  async update(id: string, input: UpdateResultInput) {
    const existing = await this.findOne(id);
    if (input.examId !== undefined || input.assignmentId !== undefined) {
      this.assertExactlyOneParent(input as CreateResultInput);
    }
    if (input.score !== undefined) {
      await this.assertScoreWithinFullMarks({
        score: input.score,
        examId: input.examId ?? existing.examId ?? undefined,
        assignmentId: input.assignmentId ?? existing.assignmentId ?? undefined,
      });
    }
    return this.prisma.result.update({ where: { id }, data: input });
  }

  private async assertScoreWithinFullMarks(input: { score: number; examId?: string; assignmentId?: string }) {
    const fullMarks = input.examId
      ? (await this.prisma.exam.findUnique({ where: { id: input.examId } }))?.fullMarks
      : input.assignmentId
        ? (await this.prisma.assignment.findUnique({ where: { id: input.assignmentId } }))?.fullMarks
        : undefined;

    if (fullMarks !== undefined && input.score > fullMarks) {
      throw new BadRequestException(`Score (${input.score}) cannot exceed full marks (${fullMarks})`);
    }
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
