import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { LessonsService } from './lessons.service';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonInput, UpdateLessonInput } from './dto/lesson.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Lesson)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class LessonsResolver {
  constructor(private lessonsService: LessonsService) {}

  @Query(() => [Lesson])
  lessons(
    @CurrentUser() user: { id: string; role: Role },
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.lessonsService.findAll(user, skip, take);
  }

  @Query(() => Lesson)
  lesson(@Args('id', { type: () => ID }) id: string) {
    return this.lessonsService.findOne(id);
  }

  @Mutation(() => Lesson)
  @Roles(Role.ADMIN)
  createLesson(@Args('input') input: CreateLessonInput) {
    return this.lessonsService.create(input);
  }

  @Mutation(() => Lesson)
  @Roles(Role.ADMIN, Role.TEACHER)
  updateLesson(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateLessonInput) {
    return this.lessonsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeLesson(@Args('id', { type: () => ID }) id: string) {
    return this.lessonsService.remove(id);
  }

  @ResolveField('subjectName', () => String, { nullable: true })
  subjectName(@Parent() lesson: any) {
    return lesson.subject?.name;
  }

  @ResolveField('className', () => String, { nullable: true })
  className(@Parent() lesson: any) {
    return lesson.class?.name;
  }

  @ResolveField('teacherName', () => String, { nullable: true })
  teacherName(@Parent() lesson: any) {
    const t = lesson.teacher;
    return t ? `${t.name} ${t.surname}` : undefined;
  }
}
