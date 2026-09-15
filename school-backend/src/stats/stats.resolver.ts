import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { StatsService } from './stats.service';
import { DashboardCounts, DailyAttendance } from './entities/stats.entity';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver()
@UseGuards(GqlJwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER, Role.PRINCIPAL)
export class StatsResolver {
  constructor(private statsService: StatsService) {}

  @Query(() => DashboardCounts)
  dashboardCounts() {
    return this.statsService.getDashboardCounts();
  }

  @Query(() => [DailyAttendance])
  weeklyAttendance() {
    return this.statsService.getWeeklyAttendance();
  }
}