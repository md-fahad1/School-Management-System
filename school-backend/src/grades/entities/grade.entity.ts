import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { EducationLevel } from '@prisma/client';

@ObjectType()
export class Grade {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  level: number;

  // Display name, e.g. "Class 10" or "HSC 1st Year".
  @Field({ nullable: true })
  name?: string;

  @Field(() => EducationLevel)
  stage: EducationLevel;
}