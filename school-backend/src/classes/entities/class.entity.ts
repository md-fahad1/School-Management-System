import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Class {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  capacity: number;

  @Field(() => ID)
  gradeId: string;

  @Field(() => ID, { nullable: true })
  supervisorId?: string;

  @Field({ nullable: true })
  gradeLevel?: number;

  @Field({ nullable: true })
  supervisorName?: string;
}
