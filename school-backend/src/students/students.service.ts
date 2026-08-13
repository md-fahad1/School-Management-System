import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentInput, UpdateStudentInput } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, skip = 0, take = 10) {
    return this.prisma.student.findMany({
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
      include: { user: true, class: true, grade: true, parent: true },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true, class: true, grade: true, parent: true },
    });
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }

  async create(input: CreateStudentInput) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username: input.username }, { email: input.email }] },
    });
    if (existing) throw new BadRequestException('Username or email already in use');

    const targetClass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      include: { _count: { select: { students: true } } },
    });
    if (!targetClass) throw new BadRequestException('Class not found');
    if (targetClass._count.students >= targetClass.capacity) {
      throw new BadRequestException('Class is at full capacity');
    }

    const hashed = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashed,
        role: Role.STUDENT,
        student: {
          create: {
            name: input.name,
            surname: input.surname,
            phone: input.phone,
            address: input.address,
            classId: input.classId,
            gradeId: input.gradeId,
            parentId: input.parentId,
          },
        },
      },
      include: { student: true },
    });

    return user.student;
  }

  async update(id: string, input: UpdateStudentInput) {
    await this.findOne(id);
    return this.prisma.student.update({
      where: { id },
      data: {
        name: input.name,
        surname: input.surname,
        phone: input.phone,
        address: input.address,
        classId: input.classId,
        gradeId: input.gradeId,
        parentId: input.parentId,
      },
    });
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    await this.prisma.user.delete({ where: { id: student.userId } });
    return true;
  }
}
