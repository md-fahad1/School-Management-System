import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class CreateGradeInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  level: number;
}

@InputType()
export class UpdateGradeInput extends PartialType(CreateGradeInput) {}
