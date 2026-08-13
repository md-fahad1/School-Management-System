import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ResultsService } from './results.service';
import { Result } from './entities/result.entity';
import { CreateResultInput, UpdateResultInput } from './dto/result.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Result)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class ResultsResolver {
  constructor(private resultsService: ResultsService) {}

  @Query(() => [Result])
  results(
    @CurrentUser() user: { id: string; role: Role },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.resultsService.findAll(user, skip, take);
  }

  @Query(() => Result)
  result(@Args('id', { type: () => ID }) id: string) {
    return this.resultsService.findOne(id);
  }

  @Mutation(() => Result)
  @Roles(Role.ADMIN, Role.TEACHER)
  createResult(@Args('input') input: CreateResultInput) {
    return this.resultsService.create(input);
  }

  @Mutation(() => Result)
  @Roles(Role.ADMIN, Role.TEACHER)
  updateResult(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateResultInput) {
    return this.resultsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN, Role.TEACHER)
  removeResult(@Args('id', { type: () => ID }) id: string) {
    return this.resultsService.remove(id);
  }

  // These read off the `student`/`exam`/`assignment` relations eagerly
  // included in findAll/findOne — a result is linked to exactly one of
  // exam or assignment, so we fall back between them for the joined data.
  @ResolveField('studentName', () => String, { nullable: true })
  studentName(@Parent() result: any) {
    const s = result.student;
    return s ? `${s.name} ${s.surname}` : undefined;
  }

  @ResolveField('subjectName', () => String, { nullable: true })
  subjectName(@Parent() result: any) {
    return result.exam?.lesson?.subject?.name ?? result.assignment?.lesson?.subject?.name;
  }

  @ResolveField('className', () => String, { nullable: true })
  className(@Parent() result: any) {
    return result.exam?.lesson?.class?.name ?? result.assignment?.lesson?.class?.name;
  }

  @ResolveField('teacherName', () => String, { nullable: true })
  teacherName(@Parent() result: any) {
    const t = result.exam?.lesson?.teacher ?? result.assignment?.lesson?.teacher;
    return t ? `${t.name} ${t.surname}` : undefined;
  }

  @ResolveField('date', () => Date, { nullable: true })
  date(@Parent() result: any) {
    return result.exam?.startTime ?? result.assignment?.dueDate;
  }

  @ResolveField('type', () => String, { nullable: true })
  type(@Parent() result: any) {
    return result.examId ? 'exam' : 'assignment';
  }
}
