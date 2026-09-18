import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { DiscountType } from '@prisma/client';

registerEnumType(DiscountType, { name: 'DiscountType' });

@ObjectType()
export class Scholarship {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => DiscountType)
  type!: DiscountType;

  @Field(() => Float)
  value!: number;

  @Field()
  active!: boolean;

  @Field()
  startDate!: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => ID)
  studentId!: string;
    @Field({ nullable: true })
  studentName?: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}