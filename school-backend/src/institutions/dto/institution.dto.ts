import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { InstitutionStatus, InstitutionType } from '@prisma/client';
import {
  IsEmail, IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min, MinLength,
} from 'class-validator';

registerEnumType(InstitutionType, { name: 'InstitutionType' });
registerEnumType(InstitutionStatus, { name: 'InstitutionStatus' });

@InputType()
export class CreateInstitutionInput {
  @Field()
  @IsString()
  @MinLength(2)
  name!: string;

  // Short unique code used in URLs and public sign-up, e.g. "abc-school".
  @Field()
  @IsString()
  @Matches(/^[a-z0-9-]{3,40}$/, {
    message: 'slug must be 3-40 characters: lowercase letters, numbers, hyphens',
  })
  slug!: string;

  @Field(() => InstitutionType, { nullable: true })
  @IsOptional()
  @IsEnum(InstitutionType)
  type?: InstitutionType;

  // ---- first admin account of this institution ----
  @Field()
  @IsString()
  adminUsername!: string;

  @Field()
  @IsEmail()
  adminEmail!: string;

  @Field()
  @IsString()
  @MinLength(6)
  adminPassword!: string;

  @Field()
  @IsString()
  adminName!: string;

  @Field()
  @IsString()
  adminSurname!: string;
}

@InputType()
export class UpdateInstitutionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  eiin?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  website?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  establishedYear?: number;
}