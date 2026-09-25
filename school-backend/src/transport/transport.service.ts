import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleInput, UpdateVehicleInput } from './dto/vehicle.dto';
import { CreateRouteInput, UpdateRouteInput, CreateStopInput, UpdateStopInput } from './dto/route.dto';
import { requireInstitutionId } from '../tenant/tenant-context';
import { AuditService, AuditAction } from '../audit/audit.service';

@Injectable()
export class TransportService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  findAllVehicles(skip = 0, take = 50) {
    return this.prisma.vehicle.findMany({
      skip,
      take,
      orderBy: { vehicleNumber: 'asc' },
      include: { transportStaff: true, assignedRoute: true },
    });
  }

  async findOneVehicle(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { transportStaff: true, assignedRoute: true },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);
    return vehicle;
  }

  create(input: CreateVehicleInput) {
    return this.prisma.vehicle.create({ data: { ...input, institutionId: requireInstitutionId() } });
  }

  async update(id: string, input: UpdateVehicleInput) {
    await this.findOneVehicle(id);
    return this.prisma.vehicle.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.findOneVehicle(id);
    await this.prisma.vehicle.delete({ where: { id } });
    return true;
  }

  /** A transport staff member's own assigned vehicles, for their dashboard. */
  findMyVehicles(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { transportStaff: { userId } },
      orderBy: { vehicleNumber: 'asc' },
    });
  }

  /* ---------- Routes ---------- */

  findAllRoutes() {
    return this.prisma.route.findMany({
      where: { institutionId: requireInstitutionId() },
      orderBy: { name: 'asc' },
      include: { stops: { orderBy: { order: 'asc' } } },
    });
  }

  async findOneRoute(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: { stops: { orderBy: { order: 'asc' } } },
    });
    if (!route) throw new NotFoundException(`Route ${id} not found`);
    return route;
  }

  async createRoute(input: CreateRouteInput, actorId?: string) {
    const route = await this.prisma.route.create({
      data: { ...input, institutionId: requireInstitutionId() },
    });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ROUTE_CREATE,
      success: true,
      metadata: { routeId: route.id, name: route.name },
    });
    return route;
  }

  async updateRoute(id: string, input: UpdateRouteInput, actorId?: string) {
    await this.findOneRoute(id);
    const route = await this.prisma.route.update({ where: { id }, data: input });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ROUTE_UPDATE,
      success: true,
      metadata: { routeId: id },
    });
    return route;
  }

  async removeRoute(id: string, actorId?: string) {
    await this.findOneRoute(id);
    await this.prisma.route.delete({ where: { id } });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ROUTE_DELETE,
      success: true,
      metadata: { routeId: id },
    });
    return true;
  }

  /* ---------- Stops ---------- */

  async createStop(input: CreateStopInput, actorId?: string) {
    const stop = await this.prisma.stop.create({ data: input });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.STOP_CREATE,
      success: true,
      metadata: { stopId: stop.id, routeId: input.routeId, name: stop.name },
    });
    return stop;
  }

  async updateStop(id: string, input: UpdateStopInput, actorId?: string) {
    const existing = await this.prisma.stop.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Stop ${id} not found`);
    const stop = await this.prisma.stop.update({ where: { id }, data: input });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.STOP_UPDATE,
      success: true,
      metadata: { stopId: id },
    });
    return stop;
  }

  async removeStop(id: string, actorId?: string) {
    const existing = await this.prisma.stop.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Stop ${id} not found`);
    await this.prisma.stop.delete({ where: { id } });
    await this.auditService.log({
      userId: actorId,
      action: AuditAction.STOP_DELETE,
      success: true,
      metadata: { stopId: id },
    });
    return true;
  }
}