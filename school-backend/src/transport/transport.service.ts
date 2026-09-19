import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleInput, UpdateVehicleInput } from './dto/vehicle.dto';
import { requireInstitutionId } from '../tenant/tenant-context';
@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  findAllVehicles(skip = 0, take = 50) {
    return this.prisma.vehicle.findMany({
      skip,
      take,
      orderBy: { vehicleNumber: 'asc' },
      include: { transportStaff: true },
    });
  }

  async findOneVehicle(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { transportStaff: true },
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
}