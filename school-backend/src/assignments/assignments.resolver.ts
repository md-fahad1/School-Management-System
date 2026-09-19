import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentInput, UpdateAssignmentInput } from './dto/assignment.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Assignment)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
export class AssignmentsResolver {
  constructor(private assignmentsService: AssignmentsService) {}

  @Query(() => [Assignment])
  @RequirePermissions('assignment:view')
  assignments(
    @CurrentUser() user: { id: string; role: Role },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.assignmentsService.findAll(user, skip, take);
  }

  @Query(() => Assignment)
  assignment(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string; role: Role }) {
    return this.assignmentsService.findOne(id, user);
  }

  @Mutation(() => Assignment)
  @Roles(Role.ADMIN, Role.TEACHER)
  @RequirePermissions('assignment:create')
  createAssignment(@Args('input') input: CreateAssignmentInput, @CurrentUser() user: { id: string }) {
    return this.assignmentsService.create(input, user.id);
  }

  @Mutation(() => Assignment)
  @Roles(Role.ADMIN, Role.TEACHER)
  @RequirePermissions('assignment:update')
  updateAssignment(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAssignmentInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.assignmentsService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN, Role.TEACHER)
  @RequirePermissions('assignment:delete')
  removeAssignment(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.assignmentsService.remove(id, user.id);
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
