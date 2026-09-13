import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

@InputType()
export class RecordPaymentInput {
  @Field(() => ID)
  @IsUUID()
  invoiceId!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @Field(() => PaymentMethod, { defaultValue: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}