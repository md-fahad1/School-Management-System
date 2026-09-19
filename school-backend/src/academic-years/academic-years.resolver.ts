import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AcademicYearsService } from './academic-years.service';
import { AcademicYear, Term } from './entities/academic-year.entity';
import {
  CreateAcademicYearInput,
  CreateTermInput,
  UpdateAcademicYearInput,
} from './dto/academic-year.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => AcademicYear)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class AcademicYearsResolver {
  constructor(private academicYearsService: AcademicYearsService) {}

  @Query(() => [AcademicYear])
  academicYears() {
    return this.academicYearsService.findAll();
  }

  @Query(() => AcademicYear, { nullable: true })
  currentAcademicYear() {
    return this.academicYearsService.findCurrent();
  }

  @Query(() => AcademicYear)
  academicYear(@Args('id', { type: () => ID }) id: string) {
    return this.academicYearsService.findOne(id);
  }

  @Mutation(() => AcademicYear)
  @Roles(Role.ADMIN)
  createAcademicYear(
    @Args('input') input: CreateAcademicYearInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.academicYearsService.create(input, user.id);
  }

  @Mutation(() => AcademicYear)
  @Roles(Role.ADMIN)
  updateAcademicYear(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAcademicYearInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.academicYearsService.update(id, input, user.id);
  }

  @Mutation(() => AcademicYear)
  @Roles(Role.ADMIN)
  setCurrentAcademicYear(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.academicYearsService.setCurrent(id, user.id);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeAcademicYear(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.academicYearsService.remove(id, user.id);
  }

  @Mutation(() => Term)
  @Roles(Role.ADMIN)
  addTerm(@Args('input') input: CreateTermInput) {
    return this.academicYearsService.addTerm(input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeTerm(@Args('id', { type: () => ID }) id: string) {
    return this.academicYearsService.removeTerm(id);
  }
}