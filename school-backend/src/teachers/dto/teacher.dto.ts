import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateTeacherInput {
  // account credentials
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(6)
  password: string;

  // profile
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  surname: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  subjectIds?: string[];
}

@InputType()
export class UpdateTeacherInput extends PartialType(CreateTeacherInput) {}
