import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { SendMessageInput } from './dto/message.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
@Resolver(() => Message)
@UseGuards(GqlJwtAuthGuard, PermissionsGuard)
export class MessagesResolver {
  constructor(private messagesService: MessagesService) {}

  @Query(() => [Message])
  @RequirePermissions('message:view')
  inbox(
    @CurrentUser() user: { id: string },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.messagesService.inbox(user.id, skip, take);
  }

  @Query(() => [Message])
  @RequirePermissions('message:view')
  conversation(
    @CurrentUser() user: { id: string },
    @Args('userId', { type: () => ID }) otherUserId: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.messagesService.conversation(user.id, otherUserId, skip, take);
  }

  @Mutation(() => Message)
  @RequirePermissions('message:create')
  sendMessage(@Args('input') input: SendMessageInput, @CurrentUser() user: { id: string }) {
    return this.messagesService.send(input, user.id);
  }

  @Mutation(() => Message)
  @RequirePermissions('message:view')
  markMessageRead(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.messagesService.markRead(id, user.id);
  }
  @Mutation(() => Boolean)
  @RequirePermissions('message:view')
  removeMessage(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.messagesService.remove(id, user.id);
  }

  @ResolveField('senderName', () => String, { nullable: true })
  senderName(@Parent() message: any) {
    return message.sender?.username;
  }

  @ResolveField('receiverName', () => String, { nullable: true })
  receiverName(@Parent() message: any) {
    return message.receiver?.username;
  }
}