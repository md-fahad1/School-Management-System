import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateExamInput {
  @Field()
  @IsString()
  title!: string;

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