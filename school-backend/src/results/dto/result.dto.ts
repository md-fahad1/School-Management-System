import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class CreateResultInput {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @Field(() => ID)
  @IsUUID()
  studentId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  examId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignmentId?: string;
}

@InputType()
export class UpdateResultInput extends PartialType(CreateResultInput) {}
