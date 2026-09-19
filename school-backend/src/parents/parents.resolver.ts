import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent as ParentArg } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ParentsService } from './parents.service';
import { Parent } from './entities/parent.entity';
import { CreateParentInput, UpdateParentInput } from './dto/parent.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Parent)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN)
export class ParentsResolver {
  constructor(private parentsService: ParentsService) {}

  @Query(() => [Parent])
  @RequirePermissions('parent:view')
  parents(
    @Args('search', { nullable: true }) search?: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.parentsService.findAll(search, skip, take);
  }

  @Query(() => Parent)
  parent(@Args('id', { type: () => ID }) id: string) {
    return this.parentsService.findOne(id);
  }

  @Mutation(() => Parent)
  @RequirePermissions('parent:create')
  createParent(@Args('input') input: CreateParentInput, @CurrentUser() user: { id: string }) {
    return this.parentsService.create(input, user.id);
  }

  @Mutation(() => Parent)
  @RequirePermissions('parent:update')
  updateParent(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateParentInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.parentsService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('parent:delete')
  removeParent(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.parentsService.remove(id, user.id);
  }

  @ResolveField('email', () => String, { nullable: true })
  email(@ParentArg() parent: any) {
    return parent.user?.email;
  }

  @ResolveField('students', () => [String], { nullable: true })
  students(@ParentArg() parent: any) {
    return parent.students?.map((s: any) => `${s.name} ${s.surname}`) ?? [];
  }
}
