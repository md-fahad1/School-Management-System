import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassInput, UpdateClassInput } from './dto/class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string, skip = 0, take = 10) {
    return this.prisma.class.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: { grade: true, supervisor: true },
    });
  }

  async findOne(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: { grade: true, supervisor: true },
    });
    if (!cls) throw new NotFoundException(`Class ${id} not found`);
    return cls;
  }

  create(input: CreateClassInput) {
    return this.prisma.class.create({ data: input });
  }

  async update(id: string, input: UpdateClassInput) {
    await this.findOne(id);
    return this.prisma.class.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.class.delete({ where: { id } });
    return true;
  }
}
