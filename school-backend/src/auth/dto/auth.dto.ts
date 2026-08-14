import { InputType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

registerEnumType(Role, { name: 'Role' });

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  username!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(6)
  password!: string;

  @Field(() => Role)
  @IsEnum(Role)
  role!: Role;

  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  surname!: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  username!: string;

  @Field()
  @IsString()
  password!: string;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field()
  id!: string;

  @Field()
  username!: string;

  @Field(() => Role)
  role!: Role;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsString()
  refreshToken!: string;
}

@InputType()
export class LogoutInput {
  @Field()
  @IsString()
  refreshToken!: string;
}