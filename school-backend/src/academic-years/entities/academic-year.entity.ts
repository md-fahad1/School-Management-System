import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TermType } from '@prisma/client';

@ObjectType()
export class Term {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => TermType)
  type!: TermType;

  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field(() => ID)
  academicYearId!: string;
}

@ObjectType()
export class AcademicYear {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field()
  isCurrent!: boolean;

  @Field(() => [Term], { nullable: true })
  terms?: Term[];
}