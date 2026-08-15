import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => AuditLog)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditResolver {
  constructor(private auditService: AuditService) {}

  @Query(() => [AuditLog])
  auditLogs(
    @Args('skip', { nullable: true }) skip?: number,
    @Args('take', { nullable: true }) take?: number,
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
    @Args('action', { nullable: true }) action?: string,
  ) {
    return this.auditService.findAll(skip, take, { userId, action });
  }

  @ResolveField('metadata', () => String, { nullable: true })
  metadata(@Parent() log: any) {
    return log.metadata ? JSON.stringify(log.metadata) : undefined;
  }
}