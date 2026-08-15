import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuditService, AuditAction } from '../../audit/audit.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const user = req.user;

    if (!user || !requiredRoles.includes(user.role)) {
      // A logged-in user hitting a route their role doesn't permit is a
      // meaningfully different (and more actionable) signal than an
      // anonymous request — worth having in the audit trail either way,
      // since a pattern of these can indicate a compromised account
      // probing for what it can access.
      await this.auditService.log({
        userId: user?.id,
        action: AuditAction.ACCESS_DENIED,
        success: false,
        ip: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers?.['user-agent'],
        metadata: {
          handler: context.getHandler().name,
          requiredRoles,
          actualRole: user?.role ?? 'anonymous',
        },
      });
      return false;
    }

    return true;
  }
}