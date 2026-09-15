import { ObjectType, Field, ID } from '@nestjs/graphql';
import { HrAttendanceStatus } from '../../common/enums/hr-attendance-status.enum';

@ObjectType()
export class TeacherAttendance {
  @Field(() => ID)
  id!: string;

  @Field()
  date!: Date;

  @Field(() => HrAttendanceStatus)
  status!: HrAttendanceStatus;

  @Field({ nullable: true })
  checkIn?: Date;

  @Field({ nullable: true })
  checkOut?: Date;

  @Field({ nullable: true })
  remarks?: string;

  @Field(() => ID)
  teacherId!: string;

  @Field({ nullable: true })
  teacherName?: string;
}