import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  sentAt: Date;

  @Field()
  read: boolean;

  @Field(() => ID)
  senderId: string;

  @Field(() => ID)
  receiverId: string;
}
