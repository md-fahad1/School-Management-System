import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherInput, UpdateTeacherInput } from './dto/teacher.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => Teacher)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class TeachersResolver {
  constructor(private teachersService: TeachersService) {}

  @Query(() => [Teacher])
  teachers(
    @Args('search', { nullable: true }) search?: string,
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.teachersService.findAll(search, skip, take);
  }

  @Query(() => Teacher)
  teacher(@Args('id', { type: () => ID }) id: string) {
    return this.teachersService.findOne(id);
  }

  @Mutation(() => Teacher)
  @Roles(Role.ADMIN)
  createTeacher(@Args('input') input: CreateTeacherInput) {
    return this.teachersService.create(input);
  }

  @Mutation(() => Teacher)
  @Roles(Role.ADMIN)
  updateTeacher(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateTeacherInput) {
    return this.teachersService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeTeacher(@Args('id', { type: () => ID }) id: string) {
    return this.teachersService.remove(id);
  }

  // Resolved off the `user`/`subjects`/`classes` relations eagerly
  // included in findAll/findOne — no extra round trips.
  @ResolveField('email', () => String, { nullable: true })
  email(@Parent() teacher: any) {
    return teacher.user?.email;
  }

  @ResolveField('subjects', () => [String], { nullable: true })
  subjects(@Parent() teacher: any) {
    return teacher.subjects?.map((s: any) => s.name) ?? [];
  }

  @ResolveField('classes', () => [String], { nullable: true })
  classes(@Parent() teacher: any) {
    return teacher.classes?.map((c: any) => c.name) ?? [];
  }
}
