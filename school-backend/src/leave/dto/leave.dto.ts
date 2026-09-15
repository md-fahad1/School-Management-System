import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { LeaveType } from '../../common/enums/leave-type.enum';
import { LeaveStatus } from '../../common/enums/leave-status.enum';

@InputType()
export class ApplyLeaveInput {
  @Field(() => LeaveType)
  @IsEnum(LeaveType)
  leaveType!: LeaveType;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field()
  @IsString()
  reason!: string;

  // Admin/Principal can log a leave on someone else's behalf (e.g. from
  // a phone call); defaults to the current user otherwise.
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  applicantId?: string;
}

@InputType()
export class DecideLeaveInput {
  @Field(() => ID)
  @IsUUID()
  id!: string;

  @Field(() => LeaveStatus)
  @IsEnum(LeaveStatus)
  status!: LeaveStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  remarks?: string;
}