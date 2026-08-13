import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentInput, UpdateAssignmentInput } from './dto/assignment.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Assignment)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class AssignmentsResolver {
  constructor(private assignmentsService: AssignmentsService) {}

  @Query(() => [Assignment])
  assignments(
    @CurrentUser() user: { id: string; role: Role },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.assignmentsService.findAll(user, skip, take);
  }

  @Query(() => Assignment)
  assignment(@Args('id', { type: () => ID }) id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Mutation(() => Assignment)
  @Roles(Role.ADMIN, Role.TEACHER)
  createAssignment(@Args('input') input: CreateAssignmentInput) {
    return this.assignmentsService.create(input);
  }

  @Mutation(() => Assignment)
  @Roles(Role.ADMIN, Role.TEACHER)
  updateAssignment(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAssignmentInput,
  ) {
    return this.assignmentsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN, Role.TEACHER)
  removeAssignment(@Args('id', { type: () => ID }) id: string) {
    return this.assignmentsService.remove(id);
  }

  @ResolveField('subjectName', () => String, { nullable: true })
  subjectName(@Parent() assignment: any) {
    return assignment.lesson?.subject?.name;
  }

  @ResolveField('className', () => String, { nullable: true })
  className(@Parent() assignment: any) {
    return assignment.lesson?.class?.name;
  }

  @ResolveField('teacherName', () => String, { nullable: true })
  teacherName(@Parent() assignment: any) {
    const t = assignment.lesson?.teacher;
    return t ? `${t.name} ${t.surname}` : undefined;
  }
}
