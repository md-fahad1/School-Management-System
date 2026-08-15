import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class AuditLog {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field()
  action: string;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  ip?: string;

  @Field({ nullable: true })
  userAgent?: string;

  // Stored as JSON in Postgres; stringified here rather than pulling in
  // a GraphQL JSON scalar package for one field. Consumers JSON.parse() it.
  @Field({ nullable: true })
  metadata?: string;

  @Field()
  createdAt!: Date;
}