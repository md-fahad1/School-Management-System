import { InputType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { TermType } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

registerEnumType(TermType, { name: 'TermType' });

@InputType()
export class CreateAcademicYearInput {
  @Field()
  @IsString()
  @MinLength(2)
  name!: string; // "2026" or "2026-2027"

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

@InputType()
export class UpdateAcademicYearInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

@InputType()
export class CreateTermInput {
  @Field(() => ID)
  @IsUUID()
  academicYearId!: string;

  @Field()
  @IsString()
  @MinLength(2)
  name!: string;

  @Field(() => TermType, { nullable: true })
  @IsOptional()
  @IsEnum(TermType)
  type?: TermType;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;
}