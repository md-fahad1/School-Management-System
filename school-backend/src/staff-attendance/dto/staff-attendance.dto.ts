import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { HrAttendanceStatus } from '../../common/enums/hr-attendance-status.enum';

@InputType()
export class MarkStaffAttendanceInput {
  @Field(() => ID)
  @IsUUID()
  userId!: string;

  @Field()
  @IsDateString()
  date!: string;

  @Field(() => HrAttendanceStatus)
  @IsEnum(HrAttendanceStatus)
  status!: HrAttendanceStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  remarks?: string;
}

@InputType()
export class BulkMarkStaffAttendanceEntry {
  @Field(() => ID)
  @IsUUID()
  userId!: string;

  @Field(() => HrAttendanceStatus)
  @IsEnum(HrAttendanceStatus)
  status!: HrAttendanceStatus;
}

@InputType()
export class BulkMarkStaffAttendanceInput {
  @Field()
  @IsDateString()
  date!: string;

  @Field(() => [BulkMarkStaffAttendanceEntry])
  entries!: BulkMarkStaffAttendanceEntry[];
}