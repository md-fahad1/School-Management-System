import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, LeaveStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyLeaveInput, DecideLeaveInput } from './dto/leave.dto';
import { AuditService, AuditAction } from '../audit/audit.service';

interface RequestUser {
  id: string;
  role: Role;
}

const APPLICANT_INCLUDE = {
  applicant: {
    include: {
      admin: true,
      teacher: true,
      student: true,
      parent: true,
      accountant: true,
      librarian: true,
      principal: true,
    },
  },
  approvedBy: true,
};

@Injectable()
export class LeaveService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(user: RequestUser, status?: LeaveStatus, skip = 0, take = 20) {
    const where: any = {};
    if (status) where.status = status;

    // Only Admin/Principal see everyone's leave requests; everyone else
    // only sees their own.
    if (user.role !== Role.ADMIN && user.role !== Role.PRINCIPAL) {
      where.applicantId = user.id;
    }

    return this.prisma.leave.findMany({
      where,
      skip,
      take,
      orderBy: { appliedAt: 'desc' },
      include: APPLICANT_INCLUDE,
    });
  }

  async findOne(id: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: APPLICANT_INCLUDE,
    });
    if (!leave) throw new NotFoundException(`Leave ${id} not found`);
    return leave;
  }

  apply(user: RequestUser, input: ApplyLeaveInput) {
    const canApplyForOthers = user.role === Role.ADMIN || user.role === Role.PRINCIPAL;
    const applicantId = canApplyForOthers && input.applicantId ? input.applicantId : user.id;

    if (new Date(input.endDate) < new Date(input.startDate)) {
      throw new BadRequestException('End date cannot be before start date');
    }

    return this.prisma.leave.create({
      data: {
        leaveType: input.leaveType,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        reason: input.reason,
        applicantId,
      },
      include: APPLICANT_INCLUDE,
    });
  }

  async decide(user: RequestUser, input: DecideLeaveInput) {
    const leave = await this.findOne(input.id);
    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('This leave request has already been decided');
    }

    const updated = await this.prisma.leave.update({
      where: { id: input.id },
      data: {
        status: input.status,
        remarks: input.remarks,
        decidedAt: new Date(),
        approvedById: user.id,
      },
      include: APPLICANT_INCLUDE,
    });

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LEAVE_DECIDED,
      success: true,
      metadata: { leaveId: input.id, applicantId: leave.applicantId, status: input.status },
    });

    return updated;
  }

  async cancel(user: RequestUser, id: string) {
    const leave = await this.findOne(id);
    const canManageAny = user.role === Role.ADMIN || user.role === Role.PRINCIPAL;

    if (leave.applicantId !== user.id && !canManageAny) {
      throw new BadRequestException('You can only cancel your own leave request');
    }
    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    return this.prisma.leave.update({
      where: { id },
      data: { status: LeaveStatus.CANCELLED, decidedAt: new Date() },
      include: APPLICANT_INCLUDE,
    });
  }
}