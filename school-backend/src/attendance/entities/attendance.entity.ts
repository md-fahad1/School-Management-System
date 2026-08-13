import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Attendance {
  @Field(() => ID)
  id: string;

  @Field()
  date: Date;

  @Field()
  present: boolean;

  @Field(() => ID)
  studentId: string;

  @Field(() => ID)
  lessonId: string;
}
