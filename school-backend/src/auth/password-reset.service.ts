import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { assertPasswordComplexity } from '../common/utils/password.util';

interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_HOURS = 1;

@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private audit: AuditService,
    private config: ConfigService,
  ) {}

  /**
   * Always returns true regardless of whether the email matches an
   * account — telling the caller "no account with that email" would
   * let an attacker enumerate registered users one guess at a time.
   */
  async requestReset(email: string, meta: RequestMeta = {}): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    await this.audit.log({
      userId: user?.id,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      success: Boolean(user),
      ip: meta.ip,
      userAgent: meta.userAgent,
      metadata: { email },
    });

    if (!user) return true;

    const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
    await this.email.sendPasswordResetEmail(user.email, resetUrl);

    return true;
  }

  async resetPassword(rawToken: string, newPassword: string, meta: RequestMeta = {}): Promise<boolean> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.used || stored.expiresAt < new Date()) {
      await this.audit.log({
        userId: stored?.userId,
        action: AuditAction.PASSWORD_RESET_FAILURE,
        success: false,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { reason: !stored ? 'token not found' : stored.used ? 'token already used' : 'token expired' },
      });
      throw new BadRequestException('Invalid or expired reset token');
    }

    assertPasswordComplexity(newPassword);
    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: stored.userId }, data: { password: hashed } }),
      this.prisma.passwordResetToken.update({ where: { id: stored.id }, data: { used: true } }),
      // A password reset is a strong signal to kill every existing
      // session — if the account was compromised, this cuts off the
      // attacker's access the moment the real owner resets it.
      this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revoked: false },
        data: { revoked: true, revokedAt: new Date() },
      }),
    ]);

    await this.audit.log({
      userId: stored.userId,
      action: AuditAction.PASSWORD_RESET_SUCCESS,
      success: true,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return true;
  }

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}