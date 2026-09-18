import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { PaymentStatus } from '@prisma/client';
import { FeeStructure } from './fee-structure.entity';

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@ObjectType()
export class Invoice {
  @Field(() => ID)
  id!: string;

  @Field()
  period!: string;

  @Field(() => Float)
  amount!: number;

  @Field(() => Float)
  amountPaid!: number;

  @Field(() => Float)
  discountAmount!: number;

  @Field({ nullable: true })
  discountReason?: string;

  @Field(() => Float)
  fineAmount!: number;

  @Field({ nullable: true })
  fineReason?: string;

  @Field(() => Float)
  payableAmount!: number;

  @Field()
  dueDate!: Date;

  @Field(() => PaymentStatus)
  status!: PaymentStatus;

  @Field(() => ID)
  studentId!: string;

  @Field(() => ID, { nullable: true })
  feeStructureId?: string;

  @Field(() => FeeStructure, { nullable: true })
  feeStructure?: FeeStructure;

  @Field({ nullable: true })
  studentName?: string;

  @Field(() => Float)
  balance!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}