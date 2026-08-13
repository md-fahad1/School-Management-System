import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  content: string;

  @Field(() => ID)
  @IsUUID()
  receiverId: string;
}

@InputType()
export class UpdateMessageInput extends PartialType(SendMessageInput) {}
