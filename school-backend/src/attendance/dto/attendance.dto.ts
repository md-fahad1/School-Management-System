import { InputType, Field, ID, PartialType, registerEnumType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

registerEnumType(AttendanceStatus, { name: 'AttendanceStatus' });

@InputType()
export class CreateAttendanceInput {
  @Field()
  @IsDateString()
  date!: string;

  @Field(() => AttendanceStatus)
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @Field(() => ID)
  @IsUUID()
  studentId!: string;

  @Field(() => ID)
  @IsUUID()
  lessonId!: string;
}

@InputType()
export class UpdateAttendanceInput extends PartialType(CreateAttendanceInput) {}

@InputType()
export class MarkAttendanceEntry {
  @Field(() => ID)
  @IsUUID()
  studentId!: string;

  @Field(() => AttendanceStatus)
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;
}

@InputType()
export class BulkMarkAttendanceInput {
  @Field(() => ID)
  @IsUUID()
  lessonId!: string;

  @Field()
  @IsDateString()
  date!: string;

  @Field(() => [MarkAttendanceEntry])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => MarkAttendanceEntry)
  entries!: MarkAttendanceEntry[];
}