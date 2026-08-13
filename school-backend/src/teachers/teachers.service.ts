import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherInput, UpdateTeacherInput } from './dto/teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, skip = 0, take = 10) {
    return this.prisma.teacher.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { surname: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: { user: true, subjects: true, classes: true },
    });
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true, subjects: true, classes: true },
    });
    if (!teacher) throw new NotFoundException(`Teacher ${id} not found`);
    return teacher;
  }

  async create(input: CreateTeacherInput) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username: input.username }, { email: input.email }] },
    });
    if (existing) throw new BadRequestException('Username or email already in use');

    const hashed = await bcrypt.hash(input.password, 10);

    // User + Teacher profile created together so a teacher record
    // never exists without a matching login account.
    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashed,
        role: Role.TEACHER,
        teacher: {
          create: {
            name: input.name,
            surname: input.surname,
            phone: input.phone,
            address: input.address,
            subjects: input.subjectIds
              ? { connect: input.subjectIds.map((id) => ({ id })) }
              : undefined,
          },
        },
      },
      include: { teacher: true },
    });

    return user.teacher;
  }

  async update(id: string, input: UpdateTeacherInput) {
    await this.findOne(id);
    return this.prisma.teacher.update({
      where: { id },
      data: {
        name: input.name,
        surname: input.surname,
        phone: input.phone,
        address: input.address,
        subjects: input.subjectIds
          ? { set: input.subjectIds.map((id) => ({ id })) }
          : undefined,
      },
    });
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);
    // Cascades to delete the User row too (onDelete: Cascade on Teacher.user).
    await this.prisma.user.delete({ where: { id: teacher.userId } });
    return true;
  }
}
