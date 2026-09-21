import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CustomRolesService } from './custom-roles.service';
import { Permission } from './entities/permission.entity';
import { CustomRole } from './entities/custom-role.entity';
import { UserAccess, UserAccessRow } from './entities/user-access.entity';
import { CreateCustomRoleInput, UpdateCustomRoleInput, AssignUserRoleInput, SetUserPermissionInput } from './dto/permission.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => CustomRole)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN)
@RequirePermissions('role:manage')
export class PermissionsResolver {
  constructor(private customRolesService: CustomRolesService) {}

  @Query(() => [UserAccessRow])
  userAccessList(@Args('search', { nullable: true }) search?: string) {
    return this.customRolesService.listUserAccess(search);
  }

  @Query(() => UserAccess)
  userAccess(@Args('userId', { type: () => ID }) userId: string) {
    return this.customRolesService.getUserAccess(userId);
  }

  @Mutation(() => Boolean)
  removeUserPermission(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('permissionKey') permissionKey: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.customRolesService.removeUserPermission(userId, permissionKey, user.id);
  }

  @Query(() => [Permission])
  permissions() {
    return this.customRolesService.listPermissions();
  }

  @Query(() => [CustomRole])
  customRoles() {
    return this.customRolesService.listCustomRoles();
  }

  @Query(() => CustomRole)
  customRole(@Args('id', { type: () => ID }) id: string) {
    return this.customRolesService.findOne(id);
  }

  @Mutation(() => CustomRole)
  createCustomRole(@Args('input') input: CreateCustomRoleInput, @CurrentUser() user: { id: string }) {
    return this.customRolesService.create(input, user.id);
  }

  @Mutation(() => CustomRole)
  updateCustomRole(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCustomRoleInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.customRolesService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  removeCustomRole(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.customRolesService.remove(id, user.id);
  }

  @Mutation(() => Boolean)
  assignUserRole(@Args('input') input: AssignUserRoleInput, @CurrentUser() user: { id: string }) {
    return this.customRolesService
      .assignUserRole(input, user.id)
      .then(() => true);
  }

  @Mutation(() => Boolean)
  setUserPermission(@Args('input') input: SetUserPermissionInput, @CurrentUser() user: { id: string }) {
    return this.customRolesService.setUserPermission(input, user.id);
  }
}