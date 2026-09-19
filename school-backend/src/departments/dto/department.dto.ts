import { InputType, Field, PartialType, registerEnumType } from '@nestjs/graphql';
import { DepartmentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

registerEnumType(DepartmentType, { name: 'DepartmentType' });

@InputType()
export class CreateDepartmentInput {
  @Field()
  @IsString()
  @MinLength(2)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field(() => DepartmentType, { nullable: true })
  @IsOptional()
  @IsEnum(DepartmentType)
  type?: DepartmentType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class UpdateDepartmentInput extends PartialType(CreateDepartmentInput) {}