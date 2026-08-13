import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventInput, UpdateEventInput } from './dto/event.dto';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: RequestUser, skip = 0, take = 10) {
    const where = await this.visibilityFilter(user);
    return this.prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: { startTime: 'asc' },
      include: { class: true },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id }, include: { class: true } });
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    return event;
  }

  create(input: CreateEventInput) {
    return this.prisma.event.create({ data: input });
  }

  async update(id: string, input: UpdateEventInput) {
    await this.findOne(id);
    return this.prisma.event.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return true;
  }

  private async visibilityFilter(user: RequestUser) {
    if (user.role === Role.ADMIN || user.role === Role.TEACHER) return {};

    // School-wide events (classId null) are always visible; class events
    // are scoped to the student's own class or the parent's children's classes.
    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
      return { OR: [{ classId: null }, { classId: student?.classId }] };
    }

    if (user.role === Role.PARENT) {
      const parent = await this.prisma.parent.findUnique({
        where: { userId: user.id },
        include: { students: true },
      });
      const classIds = parent?.students.map((s) => s.classId) ?? [];
      return { OR: [{ classId: null }, { classId: { in: classIds } }] };
    }

    return { classId: null };
  }
}
