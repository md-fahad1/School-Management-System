import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Sex } from '../../common/enums/sex.enum';

@ObjectType()
export class Teacher {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  surname!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  img?: string;

  @Field({ nullable: true })
  bloodType?: string;

  @Field(() => Sex, { nullable: true })
  sex?: Sex;

  @Field({ nullable: true })
  birthday?: Date;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [String], { nullable: true })
  subjects?: string[];

  @Field(() => [String], { nullable: true })
  classes?: string[];

  @Field(() => ID, { nullable: true })
  userId?: string;
}