import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { StaffAttendanceService } from './staff-attendance.service';
import { StaffAttendance } from './entities/staff-attendance.entity';
import {
  BulkMarkStaffAttendanceInput,
  MarkStaffAttendanceInput,
} from './dto/staff-attendance.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => StaffAttendance)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
export class StaffAttendanceResolver {
  constructor(private staffAttendanceService: StaffAttendanceService) {}

  @Query(() => [StaffAttendance])
  @RequirePermissions('staffAttendance:view')
  staffAttendances(
    @CurrentUser() user: { id: string; role: Role },
    @Args('date', { nullable: true }) date?: string,
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.staffAttendanceService.findAll(user, date, userId, skip, take);
  }

  @Mutation(() => StaffAttendance)
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  @RequirePermissions('staffAttendance:create')
  markStaffAttendance(@Args('input') input: MarkStaffAttendanceInput) {
    return this.staffAttendanceService.markAttendance(input);
  }

  @Mutation(() => [StaffAttendance])
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  @RequirePermissions('staffAttendance:create')
  bulkMarkStaffAttendance(@Args('input') input: BulkMarkStaffAttendanceInput) {
    return this.staffAttendanceService.bulkMarkAttendance(input);
  }

  @ResolveField('staffName', () => String, { nullable: true })
  staffName(@Parent() att: any) {
    const u = att.user;
    const profile = u?.accountant ?? u?.librarian ?? u?.principal ?? u?.admin;
    return profile ? `${profile.name} ${profile.surname}` : u?.username;
  }

  @ResolveField('staffRole', () => String, { nullable: true })
  staffRole(@Parent() att: any) {
    return att.user?.role;
  }
}