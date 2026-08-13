import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => ID, { nullable: true })
  classId?: string;

  @Field({ nullable: true })
  className?: string;
}
