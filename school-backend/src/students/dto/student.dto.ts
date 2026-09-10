import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Sex } from '../../common/enums/sex.enum';

@InputType()
export class CreateStudentInput {
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

  @Field(() => ID)
  @IsUUID()
  classId!: string;

  @Field(() => ID)
  @IsUUID()
  gradeId!: string;

  @Field(() => ID)
  @IsUUID()
  parentId!: string;
}

@InputType()
export class UpdateStudentInput extends PartialType(CreateStudentInput) {}