import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateClassInput {
  @Field()
  @IsString()
  name!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  capacity!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  section?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  room?: string;

  @Field(() => ID)
  @IsUUID()
  gradeId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
    supervisorId?: string;

  // Group (Science...) or department (CSE...) this class belongs to.
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}

@InputType()
export class UpdateClassInput extends PartialType(CreateClassInput) {}
