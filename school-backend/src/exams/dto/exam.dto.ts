import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsDateString, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateExamInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsDateString()
  startTime: string;

  @Field()
  @IsDateString()
  endTime: string;

  @Field(() => ID)
  @IsUUID()
  lessonId: string;
}

@InputType()
export class UpdateExamInput extends PartialType(CreateExamInput) {}
