import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectInput, UpdateSubjectInput } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, skip = 0, take = 10) {
    return this.prisma.subject.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: { teachers: true },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { teachers: true },
    });
    if (!subject) throw new NotFoundException(`Subject ${id} not found`);
    return subject;
  }

  create(input: CreateSubjectInput) {
    return this.prisma.subject.create({
      data: {
        name: input.name,
        teachers: input.teacherIds
          ? { connect: input.teacherIds.map((id) => ({ id })) }
          : undefined,
      },
    });
  }

  async update(id: string, input: UpdateSubjectInput) {
    await this.findOne(id);
    return this.prisma.subject.update({
      where: { id },
      data: {
        name: input.name,
        teachers: input.teacherIds
          ? { set: input.teacherIds.map((id) => ({ id })) }
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.subject.delete({ where: { id } });
    return true;
  }
}
