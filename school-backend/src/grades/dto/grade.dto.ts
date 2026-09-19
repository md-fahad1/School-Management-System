import { InputType, Field, Int, PartialType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { EducationLevel } from '@prisma/client';

registerEnumType(EducationLevel, { name: 'EducationLevel' });

@InputType()
export class CreateGradeInput {
  @Field(() => Int)
  @IsInt()
  @Min(-5)  // Play = -2, Nursery = -1, KG = 0
    level!: number;

  // Display name, e.g. "Class 10" or "HSC 1st Year".
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => EducationLevel, { nullable: true })
  @IsOptional()
  @IsEnum(EducationLevel)
  stage?: EducationLevel;
}

@InputType()
export class UpdateGradeInput extends PartialType(CreateGradeInput) {}
