import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { SubjectType } from '@prisma/client';

@ObjectType()
export class Subject {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  code?: string;

  @Field(() => SubjectType, { nullable: true })
  type?: SubjectType;

  @Field(() => Float, { nullable: true })
  credit?: number;

  @Field({ nullable: true })
  isOptional?: boolean;

  @Field({ nullable: true })
  isFourthSubject?: boolean;

  @Field(() => [String], { nullable: true })
  teachers?: string[];
}