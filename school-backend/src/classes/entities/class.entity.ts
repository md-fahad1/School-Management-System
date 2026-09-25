import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Class {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  capacity!: number;

  @Field({ nullable: true })
  section?: string;

  @Field({ nullable: true })
  room?: string;

  @Field(() => ID)
  gradeId!: string;

  @Field(() => ID, { nullable: true })
  supervisorId?: string;

  @Field({ nullable: true })
  gradeLevel?: number;

  @Field({ nullable: true })
   supervisorName?: string;

  @Field(() => ID, { nullable: true })
  departmentId?: string;

  @Field({ nullable: true })
  departmentName?: string;
}
