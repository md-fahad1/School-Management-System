import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsDateString, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateAssignmentInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsDateString()
  startDate: string;

  @Field()
  @IsDateString()
  dueDate: string;

  @Field(() => ID)
  @IsUUID()
  lessonId: string;
}

@InputType()
export class UpdateAssignmentInput extends PartialType(CreateAssignmentInput) {}
