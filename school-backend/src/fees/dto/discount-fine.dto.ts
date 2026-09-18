import { InputType, Field, Float } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DiscountType } from '@prisma/client';

@InputType()
export class ApplyDiscountInput {
  @Field(() => DiscountType)
  @IsEnum(DiscountType)
  type!: DiscountType;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  value!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

@InputType()
export class ApplyFineInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}