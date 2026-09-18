import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { CreateSubjectInput, UpdateSubjectInput } from './dto/subject.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Subject)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class SubjectsResolver {
  constructor(private subjectsService: SubjectsService) {}

  @Query(() => [Subject])
  subjects(
    @Args('search', { nullable: true }) search?: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.subjectsService.findAll(search, skip, take);
  }

  @Query(() => Subject)
  subject(@Args('id', { type: () => ID }) id: string) {
    return this.subjectsService.findOne(id);
  }

  @Mutation(() => Subject)
  @Roles(Role.ADMIN)
  createSubject(@Args('input') input: CreateSubjectInput, @CurrentUser() user: { id: string }) {
    return this.subjectsService.create(input, user.id);
  }

  @Mutation(() => Subject)
  @Roles(Role.ADMIN)
  updateSubject(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSubjectInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.subjectsService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeSubject(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.subjectsService.remove(id, user.id);
  }

  @ResolveField('teachers', () => [String], { nullable: true })
  teachers(@Parent() subject: any) {
    return subject.teachers?.map((t: any) => `${t.name} ${t.surname}`) ?? [];
  }
}
