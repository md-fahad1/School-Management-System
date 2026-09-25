import { ObjectType, Field, ID } from '@nestjs/graphql';
import { AttendanceStatus } from '@prisma/client';

@ObjectType()
export class Attendance {
  @Field(() => ID)
  id!: string;

  @Field()
  date!: Date;

  @Field(() => AttendanceStatus)
  status!: AttendanceStatus;

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