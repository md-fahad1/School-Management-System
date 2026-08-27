import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field(() => ID)
  id!: string;

  @Field()
  content!: string;

  @Field()
  sentAt!: Date;

  @Field()
  read!: boolean;

    @Field(() => ID)
  senderId!: string;

  @Field(() => ID)
  receiverId!: string;

  @Field({ nullable: true })
  senderName?: string;

  @Field({ nullable: true })
  receiverName?: string;
}