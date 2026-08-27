import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DashboardCounts {
  @Field(() => Int)
  studentCount!: number;

  @Field(() => Int)
  teacherCount: number;

  @Field(() => Int)
  parentCount: number;

  @Field(() => Int)
  adminCount: number;

  @Field(() => Int)
  boysCount: number;

  @Field(() => Int)
  girlsCount: number;
}

@ObjectType()
export class DailyAttendance {
  @Field()
  day: string; // "Mon", "Tue", etc.

  @Field(() => Int)
  present: number;

  @Field(() => Int)
  absent: number;
}