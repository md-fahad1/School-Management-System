import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GuardianRelation } from '../../common/enums/guardian-relation.enum';

@ObjectType()
export class Parent {
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
  occupation?: string;

  @Field(() => GuardianRelation, { nullable: true })
  relation?: GuardianRelation;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [String], { nullable: true })
  students?: string[];
}
