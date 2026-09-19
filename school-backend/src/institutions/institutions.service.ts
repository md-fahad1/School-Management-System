import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InstitutionStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { assertPasswordComplexity } from '../common/utils/password.util';
import { CreateInstitutionInput, UpdateInstitutionInput } from './dto/institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  findAll(skip = 0, take = 20) {
    return this.prisma.institution.findMany({ skip, take, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const institution = await this.prisma.institution.findUnique({ where: { id } });
    if (!institution) throw new NotFoundException('Institution not found');
    return institution;
  }

  // Creates the institution and its first ADMIN in one transaction.
  async create(input: CreateInstitutionInput, actorId?: string) {
    const slug = input.slug.trim().toLowerCase();
    const slugTaken = await this.prisma.institution.findUnique({ where: { slug } });
    if (slugTaken) throw new BadRequestException(`Slug "${slug}" is already taken`);

    assertPasswordComplexity(input.adminPassword);
    const hashed = await bcrypt.hash(input.adminPassword, 10);

    const institution = await this.prisma.$transaction(async (tx) => {
      const created = await tx.institution.create({
        data: { name: input.name, slug, type: input.type },
      });
      await tx.user.create({
        data: {
          username: input.adminUsername,
          email: input.adminEmail,
          password: hashed,
          role: Role.ADMIN,
          emailVerified: true,
          institutionId: created.id,
          admin: { create: { name: input.adminName, surname: input.adminSurname } },
        },
      });
      return created;
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.INSTITUTION_CREATE,
      success: true,
      metadata: { institutionId: institution.id, slug },
    });
    return institution;
  }

  async update(id: string, input: UpdateInstitutionInput, actorId?: string) {
    await this.findOne(id);
    const updated = await this.prisma.institution.update({ where: { id }, data: input });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.INSTITUTION_UPDATE,
      success: true,
      metadata: { institutionId: id },
    });
    return updated;
  }

  async setStatus(id: string, status: InstitutionStatus, actorId?: string) {
    await this.findOne(id);
    const updated = await this.prisma.institution.update({ where: { id }, data: { status } });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.INSTITUTION_STATUS_CHANGE,
      success: true,
      metadata: { institutionId: id, status },
    });
    return updated;
  }
}