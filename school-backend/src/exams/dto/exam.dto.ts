import { InputType, Field, ID, Int, PartialType, registerEnumType } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ExamType } from '@prisma/client';

registerEnumType(ExamType, { name: 'ExamType' });

@InputType()
export class CreateExamInput {
  @Field()
  @IsString()
  title!: string;

  @Field(() => ExamType, { nullable: true })
  @IsOptional()
  @IsEnum(ExamType)
  examType?: ExamType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  fullMarks?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  passMarks?: number;

  @Field()
  @IsDateString()
  startTime!: string;

  @Field()
  @IsDateString()
  endTime!: string;

  @Field(() => ID)
  @IsUUID()
  lessonId!: string;
}

@InputType()
export class UpdateExamInput extends PartialType(CreateExamInput) {}