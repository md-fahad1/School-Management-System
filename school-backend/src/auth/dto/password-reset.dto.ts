import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
export class RequestPasswordResetInput {
  @Field()
  @IsEmail()
  email!: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  token!: string;

  @Field()
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

@InputType()
export class VerifyEmailInput {
  @Field()
  @IsString()
  token!: string;
}

@InputType()
export class ResendVerificationInput {
  @Field()
  @IsEmail()
  email!: string;
}