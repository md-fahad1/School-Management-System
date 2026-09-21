import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@ObjectType()
export class PermissionOverride {
  @Field()
  permissionKey!: string;

  @Field()
  granted!: boolean;
}

// One account with its base role and assigned custom role (list view).
@ObjectType()
export class UserAccessRow {
  @Field(() => ID)
  userId!: string;

  @Field()
  username!: string;

  @Field(() => Role)
  baseRole!: Role;

  @Field(() => ID, { nullable: true })
  customRoleId?: string | null;

  @Field(() => String, { nullable: true })
  customRoleName?: string | null;
}

// Detail view: adds the per-user overrides and the final computed permission set.
@ObjectType()
export class UserAccess extends UserAccessRow {
  @Field(() => [PermissionOverride])
  overrides!: PermissionOverride[];

  @Field(() => [String])
  effectivePermissions!: string[];
}