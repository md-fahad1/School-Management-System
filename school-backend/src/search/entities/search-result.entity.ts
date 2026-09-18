import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class SearchResult {
  @Field()
  type!: string; // "student" | "teacher" | "class" | "subject" | "book"

  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  subtitle?: string;

  @Field()
  url!: string;
}