import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BulkMarkAttendanceInput,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from './dto/attendance.dto';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: RequestUser, skip = 0, take = 20) {
    const where = await this.visibilityFilter(user);
    return this.prisma.attendance.findMany({ where, skip, take, orderBy: { date: 'desc' } });
  }

  async findOne(id: string) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id } });
    if (!attendance) throw new NotFoundException(`Attendance record ${id} not found`);
    return attendance;
  }

  create(input: CreateAttendanceInput) {
    return this.prisma.attendance.create({ data: input });
  }

  // One mutation for a teacher to mark a whole class's attendance for a
  // lesson in one shot, rather than N individual create calls.
  async bulkMark(input: BulkMarkAttendanceInput) {
    const created = await this.prisma.$transaction(
      input.entries.map((entry) =>
        this.prisma.attendance.create({
          data: {
            date: input.date,
            present: entry.present,
            studentId: entry.studentId,
            lessonId: input.lessonId,
          },
        }),
      ),
    );
    return created;
  }

  async update(id: string, input: UpdateAttendanceInput) {
    await this.findOne(id);
    return this.prisma.attendance.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.attendance.delete({ where: { id } });
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
