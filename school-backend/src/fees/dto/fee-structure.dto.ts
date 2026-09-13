import { InputType, Field, Float } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { FeeFrequency } from '@prisma/client';

@InputType()
export class CreateFeeStructureInput {
  @Field()
  @IsString()
  name!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount!: number;

  @Field(() => FeeFrequency, { defaultValue: FeeFrequency.TERM })
  @IsEnum(FeeFrequency)
  frequency!: FeeFrequency;

  @Field(() => String)
  @IsUUID()
  gradeId!: string;
}

@InputType()
export class UpdateFeeStructureInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @Field(() => FeeFrequency, { nullable: true })
  @IsOptional()
  @IsEnum(FeeFrequency)
  frequency?: FeeFrequency;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  gradeId?: string;
}