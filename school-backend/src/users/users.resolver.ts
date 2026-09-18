import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UserSummary } from './entities/user-summary.entity';
import { Me } from './entities/me.entity';
import {
  UpdateProfileInput,
  UpdateAvatarInput,
  UpdateNotificationPreferencesInput,
} from './dto/update-profile.dto';
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

  // Powers the profile dropdown/page — the currently logged-in user's
  // own name, contact info, role and avatar.
  @Query(() => Me)
  me(@CurrentUser() user: { id: string }) {
    return this.usersService.getMe(user.id);
  }

  @Mutation(() => Me)
  updateProfile(
    @CurrentUser() user: { id: string; role: Role },
    @Args('input') input: UpdateProfileInput,
  ) {
    return this.usersService.updateProfile(user.id, user.role, input);
  }

  // `input.image` is a Cloudinary `secure_url` the browser already
  // uploaded to (unsigned preset) — this just persists the reference.
  @Mutation(() => Me)
  updateAvatar(@CurrentUser() user: { id: string }, @Args('input') input: UpdateAvatarInput) {
    return this.usersService.updateAvatar(user.id, input.image);
  }
    @Mutation(() => Me)
  updateMyNotificationPreferences(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateNotificationPreferencesInput,
  ) {
    return this.usersService.updateNotificationPreferences(user.id, input);
  }
}