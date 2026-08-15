import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuditService, AuditAction } from '../audit/audit.service';

interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

const VERIFY_TOKEN_BYTES = 32;
const VERIFY_TOKEN_TTL_HOURS = 24;

@Injectable()
export class EmailVerificationService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private audit: AuditService,
    private config: ConfigService,
  ) {}

  /** Called right after a new account is created. */
  async sendVerification(userId: string, email: string): Promise<void> {
    const rawToken = crypto.randomBytes(VERIFY_TOKEN_BYTES).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({
      data: { tokenHash, userId, expiresAt },
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${rawToken}`;
    await this.email.sendVerificationEmail(email, verifyUrl);

    await this.audit.log({
      userId,
      action: AuditAction.VERIFICATION_EMAIL_SENT,
      success: true,
      metadata: { email },
    });
  }

  /**
   * Same anti-enumeration principle as password reset: always returns
   * true, whether or not the email matches an account or is already
   * verified, so this can't be used to probe which addresses are
   * registered.
   */
  async resendVerification(email: string, meta: RequestMeta = {}): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) return true;

    await this.sendVerification(user.id, user.email);
    return true;
  }

  async verifyEmail(rawToken: string, meta: RequestMeta = {}): Promise<boolean> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.expiresAt < new Date()) {
      await this.audit.log({
        userId: stored?.userId,
        action: AuditAction.EMAIL_VERIFICATION_FAILURE,
        success: false,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { reason: !stored ? 'token not found' : 'token expired' },
      });
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: stored.userId }, data: { emailVerified: true } }),
      this.prisma.emailVerificationToken.delete({ where: { id: stored.id } }),
    ]);

    await this.audit.log({
      userId: stored.userId,
      action: AuditAction.EMAIL_VERIFIED,
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