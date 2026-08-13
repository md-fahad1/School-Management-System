import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Assignment {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  startDate: Date;

  @Field()
  dueDate: Date;

  @Field(() => ID)
  lessonId: string;

  @Field({ nullable: true })
  subjectName?: string;

  @Field({ nullable: true })
  className?: string;

  @Field({ nullable: true })
  teacherName?: string;
}
