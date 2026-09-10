import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Sex } from '../../common/enums/sex.enum';

@ObjectType()
export class Student {
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

  @Field(() => ID)
  classId!: string;

  @Field(() => ID)
  gradeId!: string;

  @Field(() => ID)
  parentId!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  className?: string;

  @Field({ nullable: true })
  gradeLevel?: number;

  @Field({ nullable: true })
  parentName?: string;

  @Field(() => ID, { nullable: true })
  userId?: string;
}