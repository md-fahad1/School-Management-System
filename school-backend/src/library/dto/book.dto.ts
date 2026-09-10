import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field()
  @IsString()
  title!: string;

  @Field()
  @IsString()
  author!: string;

  @Field()
  @IsString()
  isbn!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  totalCopies!: number;
}

@InputType()
export class UpdateBookInput extends PartialType(CreateBookInput) {}