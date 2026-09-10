import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  author!: string;

  @Field()
  isbn!: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => Int)
  totalCopies!: number;

  @Field(() => Int)
  availableCopies!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}