import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Day } from '@prisma/client';

registerEnumType(Day, { name: 'Day' });

@ObjectType()
export class Lesson {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Day)
  day: Day;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => ID)
  subjectId: string;

  @Field(() => ID)
  classId: string;

  @Field(() => ID)
  teacherId: string;

  @Field({ nullable: true })
  subjectName?: string;

  @Field({ nullable: true })
  className?: string;

  @Field({ nullable: true })
  teacherName?: string;
}
