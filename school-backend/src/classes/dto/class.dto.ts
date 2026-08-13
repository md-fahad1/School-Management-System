import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateClassInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  capacity: number;

  @Field(() => ID)
  @IsUUID()
  gradeId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  supervisorId?: string;
}

@InputType()
export class UpdateClassInput extends PartialType(CreateClassInput) {}
