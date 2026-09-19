import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { CreateDepartmentInput, UpdateDepartmentInput } from './dto/department.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Department)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class DepartmentsResolver {
  constructor(private departmentsService: DepartmentsService) {}

  @Query(() => [Department])
  departments(@Args('search', { nullable: true }) search?: string) {
    return this.departmentsService.findAll(search);
  }

  @Query(() => Department)
  department(@Args('id', { type: () => ID }) id: string) {
    return this.departmentsService.findOne(id);
  }

  @Mutation(() => Department)
  @Roles(Role.ADMIN)
  createDepartment(
    @Args('input') input: CreateDepartmentInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.departmentsService.create(input, user.id);
  }

  @Mutation(() => Department)
  @Roles(Role.ADMIN)
  updateDepartment(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDepartmentInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.departmentsService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeDepartment(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.departmentsService.remove(id, user.id);
  }

  @ResolveField('classCount', () => Number, { nullable: true })
  classCount(@Parent() department: any) {
    return department._count?.classes;
  }
}