import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TransportService } from './transport.service';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleInput, UpdateVehicleInput } from './dto/vehicle.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Vehicle)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class TransportResolver {
  constructor(private transportService: TransportService) {}

  @Query(() => [Vehicle])
  @Roles(Role.ADMIN, Role.TRANSPORT_STAFF, Role.PRINCIPAL)
  vehicles(
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.transportService.findAllVehicles(skip, take);
  }

  @Query(() => [Vehicle])
  @Roles(Role.TRANSPORT_STAFF)
  myVehicles(@CurrentUser() user: { id: string }) {
    return this.transportService.findMyVehicles(user.id);
  }

  @Query(() => Vehicle)
  @Roles(Role.ADMIN, Role.TRANSPORT_STAFF, Role.PRINCIPAL)
  vehicle(@Args('id', { type: () => ID }) id: string) {
    return this.transportService.findOneVehicle(id);
  }

  @Mutation(() => Vehicle)
  @Roles(Role.ADMIN)
  createVehicle(@Args('input') input: CreateVehicleInput) {
    return this.transportService.create(input);
  }

  @Mutation(() => Vehicle)
  @Roles(Role.ADMIN, Role.TRANSPORT_STAFF)
  updateVehicle(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateVehicleInput) {
    return this.transportService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  removeVehicle(@Args('id', { type: () => ID }) id: string) {
    return this.transportService.remove(id);
  }

  @ResolveField('transportStaffName', () => String, { nullable: true })
  transportStaffName(@Parent() vehicle: any) {
    const t = vehicle.transportStaff;
    return t ? `${t.name} ${t.surname}` : undefined;
  }
}