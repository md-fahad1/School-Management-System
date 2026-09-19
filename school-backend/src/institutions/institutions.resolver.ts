import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InstitutionStatus, Role } from '@prisma/client';
import { InstitutionsService } from './institutions.service';
import { Institution } from './entities/institution.entity';
import { CreateInstitutionInput, UpdateInstitutionInput } from './dto/institution.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Institution)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class InstitutionsResolver {
  constructor(private institutionsService: InstitutionsService) {}

  // ---- platform owner only ----
  @Query(() => [Institution])
  @Roles(Role.SUPER_ADMIN)
  institutions(
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.institutionsService.findAll(skip, take);
  }

  @Mutation(() => Institution)
  @Roles(Role.SUPER_ADMIN)
  createInstitution(
    @Args('input') input: CreateInstitutionInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.institutionsService.create(input, user.id);
  }

  @Mutation(() => Institution)
  @Roles(Role.SUPER_ADMIN)
  setInstitutionStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => InstitutionStatus }) status: InstitutionStatus,
    @CurrentUser() user: { id: string },
  ) {
    return this.institutionsService.setStatus(id, status, user.id);
  }

  // ---- any logged-in user of an institution ----
  @Query(() => Institution)
  myInstitution(@CurrentUser() user: { institutionId?: string }) {
    return this.institutionsService.findOne(user.institutionId as string);
  }

  @Mutation(() => Institution)
  @Roles(Role.ADMIN)
  updateMyInstitution(
    @Args('input') input: UpdateInstitutionInput,
    @CurrentUser() user: { id: string; institutionId?: string },
  ) {
    return this.institutionsService.update(user.institutionId as string, input, user.id);
  }
}