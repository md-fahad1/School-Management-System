import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Exam {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field(() => Int)
  fullMarks!: number;

  @Field(() => Int)
  passMarks!: number;

  @Field()
  startTime!: Date;

  @Field()
  endTime!: Date;

  @Field(() => ID)
  lessonId!: string;

  @Field({ nullable: true })
  subjectName?: string;

  @Field({ nullable: true })
  className?: string;

  @Field({ nullable: true })
  teacherName?: string;
}