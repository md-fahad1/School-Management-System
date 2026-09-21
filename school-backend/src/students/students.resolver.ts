import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { CreateStudentInput, UpdateStudentInput, UpdateStudentStatusInput } from './dto/student.dto';
import { StudentStatus } from '../common/enums/student-status.enum';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ImportResult } from './entities/import-result.entity';


@Resolver(() => Student)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
export class StudentsResolver {
  constructor(private studentsService: StudentsService) {}

  @Query(() => [Student])
  @Roles(Role.PARENT)
  myChildren(@CurrentUser() user: { id: string }) {
    return this.studentsService.findMyChildren(user.id);
  }

  @Query(() => [Student])
  @Roles(Role.ADMIN, Role.TEACHER, Role.PRINCIPAL)
  @RequirePermissions('student:view')
  students(
    @Args('search', { nullable: true }) search?: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
    @Args('status', { type: () => StudentStatus, nullable: true }) status?: StudentStatus,
  ) {
    return this.studentsService.findAll(search, skip, take, status);
  }

  @Query(() => Student)
  student(@Args('id', { type: () => ID }) id: string) {
    return this.studentsService.findOne(id);
  }

  @Mutation(() => Student)
  @Roles(Role.ADMIN)
  @RequirePermissions('student:create')
  createStudent(@Args('input') input: CreateStudentInput, @CurrentUser() user: { id: string }) {
    return this.studentsService.create(input, user.id);
  }

  @Mutation(() => Student)
  @Roles(Role.ADMIN)
  @RequirePermissions('student:update')
  updateStudent(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateStudentInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.studentsService.update(id, input, user.id);
  }

  @Mutation(() => Student)
  @Roles(Role.ADMIN)
  @RequirePermissions('student:update')
  updateStudentStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateStudentStatusInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.studentsService.updateStatus(id, input.status, user.id, input.reason);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  @RequirePermissions('student:delete')
  removeStudent(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.studentsService.remove(id, user.id);
  }
    @Mutation(() => ImportResult)
  @Roles(Role.ADMIN)
  @RequirePermissions('student:create')
  importStudentsCsv(@Args('csv') csv: string, @CurrentUser() user: { id: string }) {
    return this.studentsService.importFromCsv(csv, user.id);
  }

  @ResolveField('email', () => String, { nullable: true })
  email(@Parent() student: any) {
    return student.user?.email;
  }

  @ResolveField('className', () => String, { nullable: true })
  className(@Parent() student: any) {
    return student.class?.name;
  }

  @ResolveField('gradeLevel', () => Number, { nullable: true })
  gradeLevel(@Parent() student: any) {
    return student.grade?.level;
  }

  @ResolveField('parentName', () => String, { nullable: true })
  parentName(@Parent() student: any) {
    const p = student.parent;
    return p ? `${p.name} ${p.surname}` : undefined;
  }
}