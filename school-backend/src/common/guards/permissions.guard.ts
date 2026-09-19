import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { PermissionsService } from '../../permissions/permissions.service';
import { AuditService, AuditAction } from '../../audit/audit.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
    private auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const user = req.user;
    if (!user) return false;

    const allowed = await this.permissionsService.hasAnyPermission(
      user.id,
      user.role as Role,
      requiredPermissions,
    );

    if (!allowed) {
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.ACCESS_DENIED,
        success: false,
        ip: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers?.['user-agent'],
        metadata: {
          handler: context.getHandler().name,
          requiredPermissions,
          actualRole: user.role,
        },
      });
    }

    return allowed;
  }
}