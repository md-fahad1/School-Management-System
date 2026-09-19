import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Permission {
  @Field(() => ID)
  id!: string;

  @Field()
  key!: string;

  @Field()
  module!: string;

  @Field()
  action!: string;

  @Field({ nullable: true })
  description?: string;
}