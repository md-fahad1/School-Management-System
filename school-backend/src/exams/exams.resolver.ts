import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ExamsService } from './exams.service';
import { Exam } from './entities/exam.entity';
import { CreateExamInput, UpdateExamInput } from './dto/exam.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Exam)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class ExamsResolver {
  constructor(private examsService: ExamsService) {}

  @Query(() => [Exam])
  exams(
    @CurrentUser() user: { id: string; role: Role },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.examsService.findAll(user, skip, take);
  }

  @Query(() => Exam)
  exam(@Args('id', { type: () => ID }) id: string) {
    return this.examsService.findOne(id);
  }

  @Mutation(() => Exam)
  @Roles(Role.ADMIN, Role.TEACHER)
  createExam(@Args('input') input: CreateExamInput) {
    return this.examsService.create(input);
  }

  @Mutation(() => Exam)
  @Roles(Role.ADMIN, Role.TEACHER)
  updateExam(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateExamInput) {
    return this.examsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN, Role.TEACHER)
  removeExam(@Args('id', { type: () => ID }) id: string) {
    return this.examsService.remove(id);
  }

  // These resolve off the `lesson` relation that findAll/findOne eagerly
  // include, so no extra DB round-trip (no N+1) for the list view your
  // "All Exams" table needs (Subject / Class / Teacher / Date columns).
  @ResolveField('subjectName', () => String)
  subjectName(@Parent() exam: any) {
    return exam.lesson?.subject?.name;
  }

  @ResolveField('className', () => String)
  className(@Parent() exam: any) {
    return exam.lesson?.class?.name;
  }

  @ResolveField('teacherName', () => String)
  teacherName(@Parent() exam: any) {
    const t = exam.lesson?.teacher;
    return t ? `${t.name} ${t.surname}` : undefined;
  }
}
