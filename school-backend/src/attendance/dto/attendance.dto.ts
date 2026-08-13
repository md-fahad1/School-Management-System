import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsDateString, IsUUID } from 'class-validator';

@InputType()
export class CreateAttendanceInput {
  @Field()
  @IsDateString()
  date: string;

  @Field()
  @IsBoolean()
  present: boolean;

  @Field(() => ID)
  @IsUUID()
  studentId: string;

  @Field(() => ID)
  @IsUUID()
  lessonId: string;
}

@InputType()
export class UpdateAttendanceInput extends PartialType(CreateAttendanceInput) {}

@InputType()
export class MarkAttendanceEntry {
  @Field(() => ID)
  @IsUUID()
  studentId: string;

  @Field()
  @IsBoolean()
  present: boolean;
}

@InputType()
export class BulkMarkAttendanceInput {
  @Field(() => ID)
  @IsUUID()
  lessonId: string;

  @Field()
  @IsDateString()
  date: string;

  @Field(() => [MarkAttendanceEntry])
  entries: MarkAttendanceEntry[];
}
