import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherInput, UpdateTeacherInput } from './dto/teacher.dto';
import { AuditService, AuditAction } from '../audit/audit.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService, private auditService: AuditService) {}

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

  async create(input: CreateTeacherInput, actorId?: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username: input.username }, { email: input.email }] },
    });
    if (existing) throw new BadRequestException('Username or email already in use');

    const hashed = await bcrypt.hash(input.password, 10);

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
            img: input.img,
            bloodType: input.bloodType,
            sex: input.sex,
            birthday: input.birthday ? new Date(input.birthday) : undefined,
            subjects: input.subjectIds
              ? { connect: input.subjectIds.map((id) => ({ id })) }
              : undefined,
          },
        },
      },
      include: { teacher: true },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.TEACHER_CREATE,
      success: true,
      metadata: { teacherId: user.teacher?.id, name: input.name, surname: input.surname },
    });

    return user.teacher;
  }

  async update(id: string, input: UpdateTeacherInput, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.teacher.update({
      where: { id },
      data: {
        name: input.name,
        surname: input.surname,
        phone: input.phone,
        address: input.address,
        img: input.img,
        bloodType: input.bloodType,
        sex: input.sex,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
        subjects: input.subjectIds
          ? { set: input.subjectIds.map((id) => ({ id })) }
          : undefined,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.TEACHER_UPDATE,
      success: true,
      metadata: {
        teacherId: id,
        before: { name: before.name, surname: before.surname },
        after: { name: updated.name, surname: updated.surname },
      },
    });

    return updated;
  }

 async remove(id: string, actorId?: string) {
  const teacher = await this.findOne(id);

  const [lessonCount, supervisedClassCount, bookLoanCount] = await Promise.all([
    this.prisma.lesson.count({ where: { teacherId: id } }),
    this.prisma.class.count({ where: { supervisorId: id } }),
    this.prisma.bookLoan.count({
      where: { OR: [{ borrowerId: teacher.userId }, { issuedById: teacher.userId }] },
    }),
  ]);

  const blockers: string[] = [];
  if (lessonCount > 0) {
    blockers.push(`${lessonCount} lesson${lessonCount === 1 ? '' : 's'}`);
  }
  if (supervisedClassCount > 0) {
    blockers.push(`${supervisedClassCount} supervised class${supervisedClassCount === 1 ? '' : 'es'}`);
  }
  if (bookLoanCount > 0) {
    blockers.push(`${bookLoanCount} library loan${bookLoanCount === 1 ? '' : 's'}`);
  }

  if (blockers.length > 0) {
    throw new BadRequestException(
      `Cannot delete this teacher: they have ${blockers.join(', ')} on record. ` +
        `Reassign those first, or deactivate the teacher instead of deleting them.`,
    );
  }

  try {
    await this.prisma.user.delete({ where: { id: teacher.userId } });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.TEACHER_DELETE,
      success: true,
      metadata: { teacherId: id, name: teacher.name, surname: teacher.surname },
    });

    return true;
  } catch (err) {
    throw new BadRequestException(
      'Cannot delete this teacher: they still have related records elsewhere in the system.',
    );
  }
}
}