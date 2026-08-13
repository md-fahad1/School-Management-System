import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementInput, UpdateAnnouncementInput } from './dto/announcement.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Announcement)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class AnnouncementsResolver {
  constructor(private announcementsService: AnnouncementsService) {}

  @Query(() => [Announcement])
  announcements(
    @CurrentUser() user: { id: string; role: Role },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.announcementsService.findAll(user, skip, take);
  }

  @Query(() => Announcement)
  announcement(@Args('id', { type: () => ID }) id: string) {
    return this.announcementsService.findOne(id);
  }

  @Mutation(() => Announcement)
  @Roles(Role.ADMIN, Role.TEACHER)
  createAnnouncement(
    @Args('input') input: CreateAnnouncementInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.announcementsService.create(input, user.id);
  }

  @Mutation(() => Announcement)
  @Roles(Role.ADMIN, Role.TEACHER)
  updateAnnouncement(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAnnouncementInput,
  ) {
    return this.announcementsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN, Role.TEACHER)
  removeAnnouncement(@Args('id', { type: () => ID }) id: string) {
    return this.announcementsService.remove(id);
  }

  @ResolveField('className', () => String, { nullable: true })
  className(@Parent() announcement: any) {
    return announcement.class?.name;
  }
}
