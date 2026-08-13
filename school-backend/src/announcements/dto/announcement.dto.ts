import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateAnnouncementInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  classId?: string;
}

@InputType()
export class UpdateAnnouncementInput extends PartialType(CreateAnnouncementInput) {}
