import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { TeacherAttendance } from './entities/teacher-attendance.entity';
import {
  BulkMarkTeacherAttendanceInput,
  MarkTeacherAttendanceInput,
} from './dto/teacher-attendance.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => TeacherAttendance)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class TeacherAttendanceResolver {
  constructor(private teacherAttendanceService: TeacherAttendanceService) {}

  @Query(() => [TeacherAttendance])
  teacherAttendances(
    @CurrentUser() user: { id: string; role: Role },
    @Args('date', { nullable: true }) date?: string,
    @Args('teacherId', { type: () => ID, nullable: true }) teacherId?: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.teacherAttendanceService.findAll(user, date, teacherId, skip, take);
  }

  @Mutation(() => TeacherAttendance)
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  markTeacherAttendance(@Args('input') input: MarkTeacherAttendanceInput) {
    return this.teacherAttendanceService.markAttendance(input);
  }

  @Mutation(() => [TeacherAttendance])
  @Roles(Role.ADMIN, Role.PRINCIPAL)
  bulkMarkTeacherAttendance(@Args('input') input: BulkMarkTeacherAttendanceInput) {
    return this.teacherAttendanceService.bulkMarkAttendance(input);
  }

  @ResolveField('teacherName', () => String, { nullable: true })
  teacherName(@Parent() att: any) {
    const t = att.teacher;
    return t ? `${t.name} ${t.surname}` : undefined;
  }
}