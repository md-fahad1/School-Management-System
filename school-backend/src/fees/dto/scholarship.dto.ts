import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { DiscountType } from '@prisma/client';

@InputType()
export class CreateScholarshipInput {
  @Field(() => ID)
  @IsUUID()
  studentId!: string;

  @Field()
  @IsString()
  name!: string;

  @Field(() => DiscountType)
  @IsEnum(DiscountType)
  type!: DiscountType;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  value!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateScholarshipInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => DiscountType, { nullable: true })
  @IsOptional()
  @IsEnum(DiscountType)
  type?: DiscountType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @Field({ nullable: true })
  @IsOptional()
  active?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}