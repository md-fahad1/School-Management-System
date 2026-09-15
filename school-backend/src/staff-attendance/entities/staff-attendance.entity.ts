import { ObjectType, Field, ID } from '@nestjs/graphql';
import { HrAttendanceStatus } from '../../common/enums/hr-attendance-status.enum';

@ObjectType()
export class StaffAttendance {
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
  userId!: string;

  @Field({ nullable: true })
  staffName?: string;

  @Field({ nullable: true })
  staffRole?: string;
}