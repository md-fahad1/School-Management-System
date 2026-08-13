import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateSubjectInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  teacherIds?: string[];
}

@InputType()
export class UpdateSubjectInput extends PartialType(CreateSubjectInput) {}
