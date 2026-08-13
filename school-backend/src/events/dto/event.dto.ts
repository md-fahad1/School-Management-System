import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateEventInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsDateString()
  startTime: string;

  @Field()
  @IsDateString()
  endTime: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  classId?: string;
}

@InputType()
export class UpdateEventInput extends PartialType(CreateEventInput) {}
