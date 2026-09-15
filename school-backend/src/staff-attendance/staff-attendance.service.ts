import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BulkMarkStaffAttendanceInput,
  MarkStaffAttendanceInput,
} from './dto/staff-attendance.dto';

interface RequestUser {
  id: string;
  role: Role;
}

const STAFF_INCLUDE = {
  user: {
    include: { accountant: true, librarian: true, principal: true, admin: true },
  },
};

@Injectable()
export class StaffAttendanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: RequestUser, date?: string, userId?: string, skip = 0, take = 50) {
    const where: any = {};
    if (date) where.date = new Date(date);
    if (userId) where.userId = userId;

    // Non-admin staff only ever see their own attendance history.
    if (user.role !== Role.ADMIN && user.role !== Role.PRINCIPAL) {
      where.userId = user.id;
    }

    return this.prisma.staffAttendance.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: STAFF_INCLUDE,
    });
  }

  markAttendance(input: MarkStaffAttendanceInput) {
    const date = new Date(input.date);
    return this.prisma.staffAttendance.upsert({
      where: { userId_date: { userId: input.userId, date } },
      create: {
        userId: input.userId,
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
      include: STAFF_INCLUDE,
    });
  }

  async bulkMarkAttendance(input: BulkMarkStaffAttendanceInput) {
    const date = new Date(input.date);
    return this.prisma.$transaction(
      input.entries.map((entry) =>
        this.prisma.staffAttendance.upsert({
          where: { userId_date: { userId: entry.userId, date } },
          create: { userId: entry.userId, date, status: entry.status },
          update: { status: entry.status },
          include: STAFF_INCLUDE,
        }),
      ),
    );
  }
}