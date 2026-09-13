import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { PaymentMethod } from '@prisma/client';

registerEnumType(PaymentMethod, { name: 'PaymentMethod' });

@ObjectType()
export class Payment {
  @Field(() => ID)
  id!: string;

  @Field(() => Float)
  amount!: number;

  @Field(() => PaymentMethod)
  method!: PaymentMethod;

  @Field()
  paidAt!: Date;

  @Field({ nullable: true })
  reference?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => ID)
  invoiceId!: string;

  @Field(() => ID)
  receivedById!: string;

  @Field({ nullable: true })
  receivedByName?: string;
}