import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role, LeaveStatus } from '@prisma/client';
import { LeaveService } from './leave.service';
import { Leave } from './entities/leave.entity';
import { ApplyLeaveInput, DecideLeaveInput } from './dto/leave.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Leave)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
export class LeaveResolver {
  constructor(private leaveService: LeaveService) {}

  @Query(() => [Leave])
  @RequirePermissions('leave:view')
  leaves(
    @CurrentUser() user: { id: string; role: Role },
    @Args('status', { type: () => LeaveStatus, nullable: true }) status?: LeaveStatus,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.leaveService.findAll(user, status, skip, take);
  }

  @Query(() => Leave)
  @RequirePermissions('leave:view')
  leave(@Args('id', { type: () => ID }) id: string) {
    return this.leaveService.findOne(id);
  }

  @Mutation(() => Leave)
  @RequirePermissions('leave:create')
  applyLeave(
    @CurrentUser() user: { id: string; role: Role },
    @Args('input') input: ApplyLeaveInput,
  ) {
    return this.leaveService.apply(user, input);
  }

  @Mutation(() => Leave)
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  @RequirePermissions('leave:approve')
  decideLeave(
    @CurrentUser() user: { id: string; role: Role },
    @Args('input') input: DecideLeaveInput,
  ) {
    return this.leaveService.decide(user, input);
  }

  @Mutation(() => Leave)
  @RequirePermissions('leave:create')
  cancelLeave(
    @CurrentUser() user: { id: string; role: Role },
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.leaveService.cancel(user, id);
  }

  @ResolveField('applicantName', () => String, { nullable: true })
  applicantName(@Parent() leave: any) {
    const a = leave.applicant;
    if (!a) return undefined;
    const profile = a.teacher ?? a.student ?? a.parent ?? a.accountant ?? a.librarian ?? a.principal ?? a.admin;
    return profile ? `${profile.name} ${profile.surname}` : a.username;
  }

  @ResolveField('applicantRole', () => String, { nullable: true })
  applicantRole(@Parent() leave: any) {
    return leave.applicant?.role;
  }

  @ResolveField('approvedByName', () => String, { nullable: true })
  approvedByName(@Parent() leave: any) {
    return leave.approvedBy?.username;
  }
}