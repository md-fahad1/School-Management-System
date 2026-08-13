import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { CreateStudentInput, UpdateStudentInput } from './dto/student.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => Student)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class StudentsResolver {
  constructor(private studentsService: StudentsService) {}

  @Query(() => [Student])
  @Roles(Role.ADMIN, Role.TEACHER)
  students(
    @Args('search', { nullable: true }) search?: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.studentsService.findAll(search, skip, take);
  }

  @Query(() => Student)
  student(@Args('id', { type: () => ID }) id: string) {
    return this.studentsService.findOne(id);
  }

  @Mutation(() => Student)
  @Roles(Role.ADMIN)
  createStudent(@Args('input') input: CreateStudentInput) {
    return this.studentsService.create(input);
  }

  @Mutation(() => Student)
  @Roles(Role.ADMIN)
  updateStudent(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateStudentInput) {
    return this.studentsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeStudent(@Args('id', { type: () => ID }) id: string) {
    return this.studentsService.remove(id);
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
