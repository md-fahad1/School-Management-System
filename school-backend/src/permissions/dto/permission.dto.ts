import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCustomRoleInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String])
  @IsArray()
  permissionKeys: string[];
}

@InputType()
export class UpdateCustomRoleInput extends PartialType(CreateCustomRoleInput) {}

@InputType()
export class AssignUserRoleInput {
  @Field(() => ID)
  @IsString()
  userId: string;

  // null dile legacy Role enum-er default permission set e ferot jabe
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  customRoleId?: string | null;
}

@InputType()
export class SetUserPermissionInput {
  @Field(() => ID)
  @IsString()
  userId: string;

  @Field()
  @IsString()
  permissionKey: string;

  // true = extra grant, false = base thekei ei permission ta revoke
  @Field()
  @IsBoolean()
  granted: boolean;
}