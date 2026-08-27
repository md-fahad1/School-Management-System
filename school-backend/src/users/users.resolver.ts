import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSummary } from './entities/user-summary.entity';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => UserSummary)
@UseGuards(GqlJwtAuthGuard)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  // Any authenticated user can see this list — it's only used to pick
  // a message recipient, and messaging itself has no role restriction
  // (see MessagesResolver), so this mirrors that same openness.
  @Query(() => [UserSummary])
  users(@CurrentUser() user: { id: string }, @Args('search', { nullable: true }) search?: string) {
    return this.usersService.findAllExcept(user.id, search);
  }
}