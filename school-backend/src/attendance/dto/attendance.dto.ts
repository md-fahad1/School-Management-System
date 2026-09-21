import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  // Without these decorators the global ValidationPipe (whitelist: true)
  // strips `entries` entirely, and nested entries would go unvalidated.
  @Field(() => [MarkAttendanceEntry])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => MarkAttendanceEntry)
  entries: MarkAttendanceEntry[];
}
