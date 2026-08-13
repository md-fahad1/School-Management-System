import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Grade {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  level: number;
}
