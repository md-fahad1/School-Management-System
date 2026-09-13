import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { FeeFrequency } from '@prisma/client';

registerEnumType(FeeFrequency, { name: 'FeeFrequency' });

@ObjectType()
export class FeeStructure {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => Float)
  amount!: number;

  @Field(() => FeeFrequency)
  frequency!: FeeFrequency;

  @Field(() => ID)
  gradeId!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}