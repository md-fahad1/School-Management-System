import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BulkMarkTeacherAttendanceInput,
  MarkTeacherAttendanceInput,
} from './dto/teacher-attendance.dto';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class TeacherAttendanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: RequestUser, date?: string, teacherId?: string, skip = 0, take = 50) {
    const where: any = {};
    if (date) where.date = new Date(date);
    if (teacherId) where.teacherId = teacherId;

    // Teachers only ever see their own attendance history.
    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: user.id } });
      where.teacherId = teacher?.id;
    }

    return this.prisma.teacherAttendance.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: { teacher: true },
    });
  }

  markAttendance(input: MarkTeacherAttendanceInput) {
    const date = new Date(input.date);
    return this.prisma.teacherAttendance.upsert({
      where: { teacherId_date: { teacherId: input.teacherId, date } },
      create: {
        teacherId: input.teacherId,
        date,
        status: input.status,
        checkIn: input.checkIn ? new Date(input.checkIn) : undefined,
        checkOut: input.checkOut ? new Date(input.checkOut) : undefined,
        remarks: input.remarks,
      },
      update: {
        status: input.status,
        checkIn: input.checkIn ? new Date(input.checkIn) : undefined,
        checkOut: input.checkOut ? new Date(input.checkOut) : undefined,
        remarks: input.remarks,
      },
      include: { teacher: true },
    });
  }

  async bulkMarkAttendance(input: BulkMarkTeacherAttendanceInput) {
    const date = new Date(input.date);
    return this.prisma.$transaction(
      input.entries.map((entry) =>
        this.prisma.teacherAttendance.upsert({
          where: { teacherId_date: { teacherId: entry.teacherId, date } },
          create: { teacherId: entry.teacherId, date, status: entry.status },
          update: { status: entry.status },
          include: { teacher: true },
        }),
      ),
    );
  }
}