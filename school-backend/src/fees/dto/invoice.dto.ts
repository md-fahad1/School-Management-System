import { InputType, Field, Float, ID } from '@nestjs/graphql';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

@InputType()
export class GenerateInvoiceInput {
  @Field(() => ID)
  @IsUUID()
  studentId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  feeStructureId?: string;

  @Field()
  @IsString()
  period!: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @Field()
  @IsDateString()
  dueDate!: string;
}

@InputType()
export class GenerateBulkInvoicesInput {
  @Field(() => ID)
  @IsUUID()
  gradeId!: string;

  @Field(() => ID)
  @IsUUID()
  feeStructureId!: string;

  @Field()
  @IsString()
  period!: string;

  @Field()
  @IsDateString()
  dueDate!: string;
}