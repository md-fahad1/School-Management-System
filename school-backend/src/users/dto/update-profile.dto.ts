import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  surname?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;
}

@InputType()
export class UpdateAvatarInput {
  // The photo itself is uploaded straight from the browser to Cloudinary
  // (unsigned upload preset) — this only ever carries back the resulting
  // secure_url, never image bytes, so the API/DB stay out of the upload
  // path entirely.
  @Field()
  @IsString()
  @IsUrl({ require_protocol: true })
  image!: string;
}
@InputType()
export class UpdateNotificationPreferencesInput {
  @Field()
  emailNotifications!: boolean;
}