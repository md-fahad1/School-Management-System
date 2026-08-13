import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Exam {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => ID)
  lessonId: string;

  @Field({ nullable: true })
  subjectName?: string;

  @Field({ nullable: true })
  className?: string;

  @Field({ nullable: true })
  teacherName?: string;
}
