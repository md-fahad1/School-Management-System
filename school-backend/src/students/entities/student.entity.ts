import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Sex } from '../../common/enums/sex.enum';
import { StudentStatus } from '../../common/enums/student-status.enum';

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

  @Field(() => StudentStatus)
  status!: StudentStatus;

  @Field({ nullable: true })
  admissionNumber?: string;

  @Field({ nullable: true })
  registrationNumber?: string;

  @Field({ nullable: true })
  emergencyContactName?: string;

  @Field({ nullable: true })
  emergencyContactPhone?: string;

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