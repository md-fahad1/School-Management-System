import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import {
  BulkMarkAttendanceInput,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from './dto/attendance.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Attendance)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class AttendanceResolver {
  constructor(private attendanceService: AttendanceService) {}

  @Query(() => [Attendance])
  attendances(
    @CurrentUser() user: { id: string; role: Role },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.attendanceService.findAll(user, skip, take);
  }

  @Query(() => Attendance)
  attendance(@Args('id', { type: () => ID }) id: string) {
    return this.attendanceService.findOne(id);
  }

  @Mutation(() => Attendance)
  @Roles(Role.ADMIN, Role.TEACHER)
  createAttendance(@Args('input') input: CreateAttendanceInput) {
    return this.attendanceService.create(input);
  }

  @Mutation(() => [Attendance])
  @Roles(Role.ADMIN, Role.TEACHER)
  bulkMarkAttendance(@Args('input') input: BulkMarkAttendanceInput) {
    return this.attendanceService.bulkMark(input);
  }

  @Mutation(() => Attendance)
  @Roles(Role.ADMIN, Role.TEACHER)
  updateAttendance(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAttendanceInput,
  ) {
    return this.attendanceService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN, Role.TEACHER)
  removeAttendance(@Args('id', { type: () => ID }) id: string) {
    return this.attendanceService.remove(id);
  }
}
