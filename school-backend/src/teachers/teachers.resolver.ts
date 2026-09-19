import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherInput, UpdateTeacherInput } from './dto/teacher.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Teacher)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
export class TeachersResolver {
  constructor(private teachersService: TeachersService) {}

  @Query(() => [Teacher])
  @RequirePermissions('teacher:view')
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
  @RequirePermissions('teacher:create')
  createTeacher(@Args('input') input: CreateTeacherInput, @CurrentUser() user: { id: string }) {
    return this.teachersService.create(input, user.id);
  }

  @Mutation(() => Teacher)
  @Roles(Role.ADMIN)
  @RequirePermissions('teacher:update')
  updateTeacher(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTeacherInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.teachersService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  @RequirePermissions('teacher:delete')
  removeTeacher(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.teachersService.remove(id, user.id);
  }

  @ResolveField('email', () => String, { nullable: true })
  email(@Parent() teacher: any) {
    return teacher.user?.email;
  }

  @ResolveField('subjects', () => [String], { nullable: true })
  subjects(@Parent() teacher: any) {
    return teacher.subjects?.map((s: any) => s.name) ?? [];
  }

  @ResolveField('subjectIds', () => [ID], { nullable: true })
  subjectIds(@Parent() teacher: any) {
    return teacher.subjects?.map((s: any) => s.id) ?? [];
  }

  @ResolveField('classes', () => [String], { nullable: true })
  classes(@Parent() teacher: any) {
    return teacher.classes?.map((c: any) => c.name) ?? [];
  }

  @ResolveField('userId', () => String, { nullable: true })
  userId(@Parent() teacher: any) {
    return teacher.userId;
  }
}