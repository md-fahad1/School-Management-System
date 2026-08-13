import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Subject {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [String], { nullable: true })
  teachers?: string[];
}
