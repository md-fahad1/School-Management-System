import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeInput, UpdateGradeInput } from './dto/grade.dto';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.grade.findMany({ orderBy: { level: 'asc' } });
  }

  async findOne(id: string) {
    const grade = await this.prisma.grade.findUnique({ where: { id } });
    if (!grade) throw new NotFoundException(`Grade ${id} not found`);
    return grade;
  }

  async create(input: CreateGradeInput) {
    const existing = await this.prisma.grade.findUnique({ where: { level: input.level } });
    if (existing) throw new BadRequestException(`Grade level ${input.level} already exists`);
    return this.prisma.grade.create({ data: input });
  }

  async update(id: string, input: UpdateGradeInput) {
    await this.findOne(id);
    return this.prisma.grade.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.grade.delete({ where: { id } });
    return true;
  }
}
