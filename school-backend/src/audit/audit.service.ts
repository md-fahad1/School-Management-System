import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum AuditAction {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGIN_LOCKED_OUT = 'LOGIN_LOCKED_OUT',
  REGISTER = 'REGISTER',
  REGISTER_DUPLICATE = 'REGISTER_DUPLICATE',
  REFRESH_SUCCESS = 'REFRESH_SUCCESS',
  REFRESH_FAILURE = 'REFRESH_FAILURE',
  REFRESH_REUSE_DETECTED = 'REFRESH_REUSE_DETECTED',
 LOGOUT = 'LOGOUT',
  LOGOUT_ALL_DEVICES = 'LOGOUT_ALL_DEVICES',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILURE = 'PASSWORD_RESET_FAILURE',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  EMAIL_VERIFICATION_FAILURE = 'EMAIL_VERIFICATION_FAILURE',
  VERIFICATION_EMAIL_SENT = 'VERIFICATION_EMAIL_SENT',
}


interface AuditEntry {
  userId?: string;
  action: AuditAction | string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

interface AuditFilter {
  userId?: string;
  action?: string;
  success?: boolean;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Writes one audit entry. Deliberately swallows its own errors —
   * a database hiccup while logging a login attempt must never turn
   * into a failed login for the user. If writing fails, it's logged
   * locally via Nest's Logger instead of propagating.
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          success: entry.success,
          ip: entry.ip,
          userAgent: entry.userAgent,
          metadata: entry.metadata as any,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log for action ${entry.action}: ${err}`);
    }
  }

  findAll(skip = 0, take = 50, filter: AuditFilter = {}) {
    return this.prisma.auditLog.findMany({
      where: filter,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(filter: AuditFilter = {}) {
    return this.prisma.auditLog.count({ where: filter });
  }
}