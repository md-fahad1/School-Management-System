import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateAssignmentInput {
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
  startDate!: string;

  @Field()
  @IsDateString()
  dueDate!: string;

  @Field(() => ID)
  @IsUUID()
  lessonId!: string;
}

@InputType()
export class UpdateAssignmentInput extends PartialType(CreateAssignmentInput) {}