import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateRouteInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class UpdateRouteInput extends PartialType(CreateRouteInput) {}

@InputType()
export class CreateStopInput {
  @Field(() => ID)
  @IsString()
  routeId!: string;

  @Field()
  @IsString()
  name!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  order?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  time?: string;
}

@InputType()
export class UpdateStopInput extends PartialType(CreateStopInput) {}