import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventInput, UpdateEventInput } from './dto/event.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Event)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class EventsResolver {
  constructor(private eventsService: EventsService) {}

  @Query(() => [Event])
  events(
    @CurrentUser() user: { id: string; role: Role },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.eventsService.findAll(user, skip, take);
  }

  @Query(() => Event)
  event(@Args('id', { type: () => ID }) id: string) {
    return this.eventsService.findOne(id);
  }

  @Mutation(() => Event)
  @Roles(Role.ADMIN, Role.TEACHER)
  createEvent(@Args('input') input: CreateEventInput) {
    return this.eventsService.create(input);
  }

  @Mutation(() => Event)
  @Roles(Role.ADMIN, Role.TEACHER)
  updateEvent(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateEventInput) {
    return this.eventsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN, Role.TEACHER)
  removeEvent(@Args('id', { type: () => ID }) id: string) {
    return this.eventsService.remove(id);
  }

  @ResolveField('className', () => String, { nullable: true })
  className(@Parent() event: any) {
    return event.class?.name;
  }
}
