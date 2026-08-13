import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementInput, UpdateAnnouncementInput } from './dto/announcement.dto';

interface RequestUser {
  id: string;
  role: Role;
}

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: RequestUser, skip = 0, take = 10) {
    const where = await this.visibilityFilter(user);
    return this.prisma.announcement.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: { class: true },
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { class: true },
    });
    if (!announcement) throw new NotFoundException(`Announcement ${id} not found`);
    return announcement;
  }

  create(input: CreateAnnouncementInput, authorId: string) {
    return this.prisma.announcement.create({ data: { ...input, authorId } });
  }

  async update(id: string, input: UpdateAnnouncementInput) {
    await this.findOne(id);
    return this.prisma.announcement.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.announcement.delete({ where: { id } });
    return true;
  }

  private async visibilityFilter(user: RequestUser) {
    if (user.role === Role.ADMIN || user.role === Role.TEACHER) return {};

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
