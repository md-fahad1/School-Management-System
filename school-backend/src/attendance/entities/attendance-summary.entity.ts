import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class AttendanceSummary {
  @Field(() => ID)
  studentId!: string;

  @Field()
  studentName!: string;

  @Field(() => Int)
  totalDays!: number;

  @Field(() => Int)
  presentDays!: number;

  @Field(() => Int)
  absentDays!: number;

  @Field(() => Int)
  lateDays!: number;

  @Field(() => Int)
  excusedDays!: number;

  @Field(() => Int)
  leaveDays!: number;

  @Field(() => Float)
  percentage!: number;
}