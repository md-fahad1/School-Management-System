import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Stop {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  order!: number;

  @Field({ nullable: true })
  time?: string;

  @Field(() => ID)
  routeId!: string;
}

@ObjectType()
export class Route {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [Stop], { nullable: true })
  stops?: Stop[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}