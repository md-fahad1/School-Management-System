import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GradesService } from './grades.service';
import { Grade } from './entities/grade.entity';
import { CreateGradeInput, UpdateGradeInput } from './dto/grade.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => Grade)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class GradesResolver {
  constructor(private gradesService: GradesService) {}

  @Query(() => [Grade])
  grades() {
    return this.gradesService.findAll();
  }

  @Query(() => Grade)
  grade(@Args('id', { type: () => ID }) id: string) {
    return this.gradesService.findOne(id);
  }

  @Mutation(() => Grade)
  @Roles(Role.ADMIN)
  createGrade(@Args('input') input: CreateGradeInput) {
    return this.gradesService.create(input);
  }

  @Mutation(() => Grade)
  @Roles(Role.ADMIN)
  updateGrade(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateGradeInput) {
    return this.gradesService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeGrade(@Args('id', { type: () => ID }) id: string) {
    return this.gradesService.remove(id);
  }
}
