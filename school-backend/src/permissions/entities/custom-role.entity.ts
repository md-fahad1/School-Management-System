import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { Permission } from './permission.entity';

@ObjectType()
export class CustomRole {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isSystem: boolean;

  @Field(() => Role, { nullable: true })
  baseRole?: Role;

  @Field(() => [Permission])
  permissions: Permission[];
}