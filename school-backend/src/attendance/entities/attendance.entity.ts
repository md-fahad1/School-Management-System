import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Attendance {
  @Field(() => ID)
  id!: string;

  @Field()
  date!: Date;

  @Field()
  present!: boolean;

 @Field(() => ID)
  studentId!: string;

  @Field(() => ID)
  lessonId!: string;

  @Field({ nullable: true })
  studentName?: string;

  @Field({ nullable: true })
  subjectName?: string;

  @Field({ nullable: true })
  className?: string;

  @Field({ nullable: true })
  teacherName?: string;
}
