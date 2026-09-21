import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { GuardianRelation } from '../../common/enums/guardian-relation.enum';

@InputType()
export class CreateParentInput {
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(6)
  password: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  surname: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  occupation?: string;

  @Field(() => GuardianRelation, { nullable: true })
  @IsOptional()
  @IsEnum(GuardianRelation)
  relation?: GuardianRelation;
}

@InputType()
export class UpdateParentInput extends PartialType(CreateParentInput) {}
