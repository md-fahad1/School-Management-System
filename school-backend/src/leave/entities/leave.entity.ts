import { ObjectType, Field, ID } from '@nestjs/graphql';
import { LeaveType } from '../../common/enums/leave-type.enum';
import { LeaveStatus } from '../../common/enums/leave-status.enum';

@ObjectType()
export class Leave {
  @Field(() => ID)
  id!: string;

  @Field(() => LeaveType)
  leaveType!: LeaveType;

  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field()
  reason!: string;

  @Field(() => LeaveStatus)
  status!: LeaveStatus;

  @Field({ nullable: true })
  remarks?: string;

  @Field()
  appliedAt!: Date;

  @Field({ nullable: true })
  decidedAt?: Date;

  @Field(() => ID)
  applicantId!: string;

  @Field({ nullable: true })
  applicantName?: string;

  @Field({ nullable: true })
  applicantRole?: string;

  @Field(() => ID, { nullable: true })
  approvedById?: string;

  @Field({ nullable: true })
  approvedByName?: string;
}