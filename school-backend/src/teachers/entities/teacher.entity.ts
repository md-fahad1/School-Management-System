import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Teacher {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  surname: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  img?: string;

  @Field({ nullable: true })
  bloodType?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [String], { nullable: true })
  subjects?: string[];

  @Field(() => [String], { nullable: true })
  classes?: string[];
}
