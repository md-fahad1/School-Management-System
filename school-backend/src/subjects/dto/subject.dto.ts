import { InputType, Field, Float, PartialType, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SubjectType } from '@prisma/client';

registerEnumType(SubjectType, { name: 'SubjectType' });

@InputType()
export class CreateSubjectInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  code?: string;

  @Field(() => SubjectType, { nullable: true })
  @IsEnum(SubjectType)
  @IsOptional()
  type?: SubjectType;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  credit?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isFourthSubject?: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  teacherIds?: string[];
}

@InputType()
export class UpdateSubjectInput extends PartialType(CreateSubjectInput) {}