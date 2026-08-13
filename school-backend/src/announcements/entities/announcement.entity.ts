import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Announcement {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  date: Date;

  @Field(() => ID, { nullable: true })
  classId?: string;

  @Field(() => ID, { nullable: true })
  authorId?: string;

  @Field({ nullable: true })
  className?: string;
}
