import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DepartmentType } from '@prisma/client';

@ObjectType()
export class Department {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  code?: string;

  @Field(() => DepartmentType)
  type!: DepartmentType;

  @Field({ nullable: true })
  description?: string;

  // How many classes use this department/group.
  @Field({ nullable: true })
  classCount?: number;
}