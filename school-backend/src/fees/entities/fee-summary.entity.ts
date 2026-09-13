import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class FeeCollectionSummary {
  @Field(() => Float)
  totalInvoiced!: number;

  @Field(() => Float)
  totalCollected!: number;

  @Field(() => Float)
  totalPending!: number;

  @Field(() => Int)
  invoiceCount!: number;

  @Field(() => Int)
  paidCount!: number;

  @Field(() => Int)
  overdueCount!: number;
}