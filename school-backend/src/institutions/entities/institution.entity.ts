import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { InstitutionStatus, InstitutionType } from '@prisma/client';

@ObjectType()
export class Institution {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => InstitutionType)
  type!: InstitutionType;

  @Field(() => InstitutionStatus)
  status!: InstitutionStatus;

  @Field({ nullable: true })
  eiin?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  website?: string;

  @Field(() => Int, { nullable: true })
  establishedYear?: number;

  @Field()
  createdAt!: Date;
}