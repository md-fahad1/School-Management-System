import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsString, IsUUID } from 'class-validator';
import { Day } from '@prisma/client';

@InputType()
export class CreateLessonInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Day)
  @IsEnum(Day)
  day: Day;

  @Field()
  @IsDateString()
  startTime: string;

  @Field()
  @IsDateString()
  endTime: string;

  @Field(() => ID)
  @IsUUID()
  subjectId: string;

  @Field(() => ID)
  @IsUUID()
  classId: string;

  @Field(() => ID)
  @IsUUID()
  teacherId: string;
}

@InputType()
export class UpdateLessonInput extends PartialType(CreateLessonInput) {}
