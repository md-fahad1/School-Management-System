import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsArray, IsDateString, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Sex } from '../../common/enums/sex.enum';

@InputType()
export class CreateTeacherInput {
  // account credentials
  @Field()
  @IsString()
  username!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(6)
  password!: string;

  // profile
  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  surname!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  img?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @Field(() => Sex, { nullable: true })
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  subjectIds?: string[];
}

@InputType()
export class UpdateTeacherInput extends PartialType(CreateTeacherInput) {}