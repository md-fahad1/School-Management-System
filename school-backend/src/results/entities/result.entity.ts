import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Result {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  score: number;

  @Field(() => ID)
  studentId: string;

  @Field(() => ID, { nullable: true })
  examId?: string;

  @Field(() => ID, { nullable: true })
  assignmentId?: string;

  @Field({ nullable: true })
  studentName?: string;

  @Field({ nullable: true })
  subjectName?: string;

  @Field({ nullable: true })
  className?: string;

  @Field({ nullable: true })
  teacherName?: string;

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  type?: string;
}
