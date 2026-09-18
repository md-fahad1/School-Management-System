import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ClassesService } from './classes.service';
import { Class } from './entities/class.entity';
import { CreateClassInput, UpdateClassInput } from './dto/class.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Class)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class ClassesResolver {
  constructor(private classesService: ClassesService) {}

  @Query(() => [Class])
  classes(
    @Args('search', { nullable: true }) search?: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.classesService.findAll(search, skip, take);
  }

  @Query(() => Class)
  class(@Args('id', { type: () => ID }) id: string) {
    return this.classesService.findOne(id);
  }

  @Mutation(() => Class)
  @Roles(Role.ADMIN)
  createClass(@Args('input') input: CreateClassInput, @CurrentUser() user: { id: string }) {
    return this.classesService.create(input, user.id);
  }

  @Mutation(() => Class)
  @Roles(Role.ADMIN)
  updateClass(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateClassInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.classesService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeClass(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.classesService.remove(id, user.id);
  }

  @ResolveField('gradeLevel', () => Number, { nullable: true })
  gradeLevel(@Parent() cls: any) {
    return cls.grade?.level;
  }

  @ResolveField('supervisorName', () => String, { nullable: true })
  supervisorName(@Parent() cls: any) {
    const s = cls.supervisor;
    return s ? `${s.name} ${s.surname}` : undefined;
  }
}
