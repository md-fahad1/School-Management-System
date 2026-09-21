import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    return this.prisma.attendance.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: { student: true, lesson: { include: { subject: true, class: true, teacher: true } } },
    });
  }

  async findOne(id: string, user?: RequestUser) {
    const where = user ? { id, ...(await this.visibilityFilter(user)) } : { id };
    const attendance = await this.prisma.attendance.findFirst({
      where,
      include: { student: true, lesson: { include: { subject: true, class: true, teacher: true } } },
    });
    if (!attendance) throw new NotFoundException(`Attendance record ${id} not found`);
    return attendance;
  }

  create(input: CreateAttendanceInput) {
    return this.prisma.attendance.create({ data: input });
  }

  // One mutation for a teacher to mark a whole class's attendance for a
  // lesson in one shot, rather than N individual create calls.
  async bulkMark(input: BulkMarkAttendanceInput, user: RequestUser) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: input.lessonId } });
    if (!lesson) throw new NotFoundException(`Lesson ${input.lessonId} not found`);

    // A teacher may only mark attendance for their own lessons.
    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: user.id } });
      if (!teacher || lesson.teacherId !== teacher.id) {
        throw new ForbiddenException('You can only mark attendance for your own lessons');
      }
    }

    // Every student must belong to the lesson's class; a repeated student is ignored.
    const byStudent = new Map(input.entries.map((e) => [e.studentId, e.present]));
    const studentIds = Array.from(byStudent.keys());
    const inClass = await this.prisma.student.count({
      where: { id: { in: studentIds }, classId: lesson.classId },
    });
    if (inClass !== studentIds.length) {
      throw new BadRequestException("Some students do not belong to this lesson's class");
    }

    // One record per student per lesson per day: saving again updates the
    // earlier marks instead of creating duplicates.
    const dayStart = new Date(input.date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const existing = await this.prisma.attendance.findMany({
      where: {
        lessonId: input.lessonId,
        studentId: { in: studentIds },
        date: { gte: dayStart, lt: dayEnd },
      },
    });
    const existingByStudent = new Map(existing.map((a) => [a.studentId, a.id]));

    return this.prisma.$transaction(
      studentIds.map((studentId) => {
        const present = byStudent.get(studentId) as boolean;
        const existingId = existingByStudent.get(studentId);
        return existingId
          ? this.prisma.attendance.update({ where: { id: existingId }, data: { present } })
          : this.prisma.attendance.create({
              data: { date: dayStart, present, studentId, lessonId: input.lessonId },
            });
      }),
    );
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
