import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserSummary {
  @Field(() => ID)
  id!: string;

  @Field()
  username!: string;

  @Field()
  roleName!: string;
}