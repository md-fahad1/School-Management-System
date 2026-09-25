import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TransportService } from './transport.service';
import { Vehicle } from './entities/vehicle.entity';
import { Route, Stop } from './entities/route.entity';
import { CreateVehicleInput, UpdateVehicleInput } from './dto/vehicle.dto';
import { CreateRouteInput, UpdateRouteInput, CreateStopInput, UpdateStopInput } from './dto/route.dto';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => Vehicle)
@UseGuards(GqlJwtAuthGuard, RolesGuard, PermissionsGuard)
export class TransportResolver {
  constructor(private transportService: TransportService) {}

  @Query(() => [Vehicle])
  @Roles(Role.ADMIN, Role.TRANSPORT_STAFF, Role.PRINCIPAL)
  @RequirePermissions('transport:view')
  vehicles(
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
  ) {
    return this.transportService.findAllVehicles(skip, take);
  }

  @Query(() => [Vehicle])
  @Roles(Role.TRANSPORT_STAFF)
  @RequirePermissions('transport:view')
  myVehicles(@CurrentUser() user: { id: string }) {
    return this.transportService.findMyVehicles(user.id);
  }

  @Query(() => Vehicle)
  @Roles(Role.ADMIN, Role.TRANSPORT_STAFF, Role.PRINCIPAL)
  @RequirePermissions('transport:view')
  vehicle(@Args('id', { type: () => ID }) id: string) {
    return this.transportService.findOneVehicle(id);
  }

  @Mutation(() => Vehicle)
  @Roles(Role.ADMIN)
  @RequirePermissions('transport:create')
  createVehicle(@Args('input') input: CreateVehicleInput) {
    return this.transportService.create(input);
  }

  @Mutation(() => Vehicle)
  @Roles(Role.ADMIN, Role.TRANSPORT_STAFF)
  @RequirePermissions('transport:update')
  updateVehicle(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateVehicleInput) {
    return this.transportService.update(id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  @RequirePermissions('transport:delete')
  removeVehicle(@Args('id', { type: () => ID }) id: string) {
    return this.transportService.remove(id);
  }

  @ResolveField('transportStaffName', () => String, { nullable: true })
  transportStaffName(@Parent() vehicle: any) {
    const t = vehicle.transportStaff;
    return t ? `${t.name} ${t.surname}` : undefined;
  }

  @ResolveField('routeName', () => String, { nullable: true })
  routeName(@Parent() vehicle: any) {
    return vehicle.assignedRoute?.name;
  }

  @Query(() => [Route])
  @Roles(Role.ADMIN, Role.TRANSPORT_STAFF, Role.PRINCIPAL)
  @RequirePermissions('transport:view')
  routes() {
    return this.transportService.findAllRoutes();
  }

  @Query(() => Route)
  @Roles(Role.ADMIN, Role.TRANSPORT_STAFF, Role.PRINCIPAL)
  @RequirePermissions('transport:view')
  route(@Args('id', { type: () => ID }) id: string) {
    return this.transportService.findOneRoute(id);
  }

  @Mutation(() => Route)
  @Roles(Role.ADMIN)
  @RequirePermissions('transport:create')
  createRoute(@Args('input') input: CreateRouteInput, @CurrentUser() user: { id: string }) {
    return this.transportService.createRoute(input, user.id);
  }

  @Mutation(() => Route)
  @Roles(Role.ADMIN)
  @RequirePermissions('transport:update')
  updateRoute(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateRouteInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.transportService.updateRoute(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  @RequirePermissions('transport:delete')
  removeRoute(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.transportService.removeRoute(id, user.id);
  }

  @Mutation(() => Stop)
  @Roles(Role.ADMIN)
  @RequirePermissions('transport:create')
  createStop(@Args('input') input: CreateStopInput, @CurrentUser() user: { id: string }) {
    return this.transportService.createStop(input, user.id);
  }

  @Mutation(() => Stop)
  @Roles(Role.ADMIN)
  @RequirePermissions('transport:update')
  updateStop(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateStopInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.transportService.updateStop(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  @RequirePermissions('transport:delete')
  removeStop(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: { id: string }) {
    return this.transportService.removeStop(id, user.id);
  }
}