import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { SendMessageInput } from './dto/message.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Message)
@UseGuards(GqlJwtAuthGuard)
export class MessagesResolver {
  constructor(private messagesService: MessagesService) {}

  @Query(() => [Message])
  inbox(
    @CurrentUser() user: { id: string },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.messagesService.inbox(user.id, skip, take);
  }

  @Query(() => [Message])
  conversation(
    @CurrentUser() user: { id: string },
    @Args('userId', { type: () => ID }) otherUserId: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.messagesService.conversation(user.id, otherUserId, skip, take);
  }

  @Mutation(() => Message)
  sendMessage(@Args('input') input: SendMessageInput, @CurrentUser() user: { id: string }) {
    return this.messagesService.send(input, user.id);
  }

  @Mutation(() => Message)
  markMessageRead(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.messagesService.markRead(id, user.id);
  }

  @Mutation(() => Boolean)
  removeMessage(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.messagesService.remove(id, user.id);
  }
}
