import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParentInput, UpdateParentInput } from './dto/parent.dto';
import { AuditService, AuditAction } from '../audit/audit.service';

@Injectable()
export class ParentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  findAll(search?: string, skip = 0, take = 10) {
    return this.prisma.parent.findMany({
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
      include: { user: true, students: true },
    });
  }

  async findOne(id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: { user: true, students: true },
    });
    if (!parent) throw new NotFoundException(`Parent ${id} not found`);
    return parent;
  }

  async create(input: CreateParentInput, actorId?: string) {
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
        role: Role.PARENT,
        parent: {
          create: {
            name: input.name,
            surname: input.surname,
            phone: input.phone,
            address: input.address,
          },
        },
      },
      include: { parent: true },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.PARENT_CREATE,
      success: true,
      metadata: { parentId: user.parent?.id, name: input.name, surname: input.surname },
    });

    return user.parent;
  }

  async update(id: string, input: UpdateParentInput, actorId?: string) {
    const before = await this.findOne(id);
    const updated = await this.prisma.parent.update({
      where: { id },
      data: {
        name: input.name,
        surname: input.surname,
        phone: input.phone,
        address: input.address,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.PARENT_UPDATE,
      success: true,
      metadata: {
        parentId: id,
        before: { name: before.name, surname: before.surname },
        after: { name: updated.name, surname: updated.surname },
      },
    });

    return updated;
  }

  async remove(id: string, actorId?: string) {
    const parent = await this.findOne(id);
    // Guard against orphaning students: block delete if children exist.
    const childCount = await this.prisma.student.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException('Cannot delete a parent with linked students');
    }
    await this.prisma.user.delete({ where: { id: parent.userId } });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.PARENT_DELETE,
      success: true,
      metadata: { parentId: id, name: parent.name, surname: parent.surname },
    });

    return true;
  }
}
