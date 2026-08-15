import { BadRequestException, Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoginAttemptsService } from './login-attempts.service';
import { EmailVerificationService } from './email-verification.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { assertPasswordComplexity } from '../common/utils/password.util';
import { LoginInput, RegisterInput, AuthPayload } from './dto/auth.dto';
import { Role } from '@prisma/client';

interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

const REFRESH_TOKEN_BYTES = 48;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
    private loginAttempts: LoginAttemptsService,
    private audit: AuditService,
    private emailVerification: EmailVerificationService,
  ) {}

  async register(input: RegisterInput, meta: RequestMeta = {}): Promise<AuthPayload> {
    // STUDENT accounts require a class/grade/parent link, so they're
    // created through the students module (which also creates the User
    // record in a transaction). This endpoint covers ADMIN, TEACHER,
    // and PARENT, which have no required relations at creation time.
    if (input.role === Role.STUDENT) {
      throw new BadRequestException(
        'Student accounts must be created via the students.create mutation',
      );
    }

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username: input.username }, { email: input.email }] },
    });
    if (existing) {
      await this.audit.log({
        action: AuditAction.REGISTER_DUPLICATE,
        success: false,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { username: input.username, email: input.email },
      });
      throw new BadRequestException('Username or email already in use');
    }

    assertPasswordComplexity(input.password);
    const hashed = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashed,
        role: input.role,
        ...(input.role === Role.ADMIN && {
          admin: { create: { name: input.name, surname: input.surname } },
        }),
        ...(input.role === Role.TEACHER && {
          teacher: { create: { name: input.name, surname: input.surname } },
        }),
        ...(input.role === Role.PARENT && {
          parent: { create: { name: input.name, surname: input.surname } },
        }),
      },
    });

    await this.audit.log({
      userId: user.id,
      action: AuditAction.REGISTER,
      success: true,
      ip: meta.ip,
      userAgent: meta.userAgent,
      metadata: { role: user.role },
    });

    // Fire-and-forget: don't let a slow/failed email send delay or
    // break account creation. EmailService already swallows its own
    // errors, so this is safe to leave unawaited-for-failure purposes,
    // but we do await the call itself so the token row is guaranteed
    // to exist before the response returns.
    await this.emailVerification.sendVerification(user.id, user.email);

    return this.issueTokenPair(user.id, user.username, user.role, meta);
  }

  async login(input: LoginInput, meta: RequestMeta = {}): Promise<AuthPayload> {
    const lockedFor = await this.loginAttempts.getLockoutRemaining(input.username);
    if (lockedFor !== null) {
      await this.audit.log({
        action: AuditAction.LOGIN_LOCKED_OUT,
        success: false,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { username: input.username, remainingSeconds: lockedFor },
      });
      throw new HttpException(
        `Account temporarily locked due to repeated failed login attempts. Try again in ${Math.ceil(lockedFor / 60)} minute(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.prisma.user.findUnique({ where: { username: input.username } });
    if (!user) {
      // Still record a failure for a nonexistent username — an attacker
      // shouldn't be able to distinguish "wrong password" from "no such
      // user" via lockout or audit-visible behavior (that would leak
      // which usernames exist).
      await this.loginAttempts.recordFailure(input.username);
      await this.audit.log({
        action: AuditAction.LOGIN_FAILURE,
        success: false,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { username: input.username, reason: 'no such user' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      const justLocked = await this.loginAttempts.recordFailure(input.username);
      await this.audit.log({
        userId: user.id,
        action: AuditAction.LOGIN_FAILURE,
        success: false,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { username: input.username, reason: 'wrong password' },
      });
      if (justLocked !== null) {
        await this.audit.log({
          userId: user.id,
          action: AuditAction.LOGIN_LOCKED_OUT,
          success: false,
          ip: meta.ip,
          userAgent: meta.userAgent,
          metadata: { username: input.username, lockedForSeconds: justLocked },
        });
        throw new HttpException(
          `Too many failed attempts. Account locked for ${Math.ceil(justLocked / 60)} minute(s).`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.loginAttempts.recordSuccess(input.username);
    await this.audit.log({
      userId: user.id,
      action: AuditAction.LOGIN_SUCCESS,
      success: true,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
    return this.issueTokenPair(user.id, user.username, user.role, meta);
  }

  /**
   * Exchanges a still-valid refresh token for a new access+refresh pair,
   * rotating the refresh token in the process. If the presented token was
   * already rotated out (i.e. someone is replaying an old token — a strong
   * signal of theft), every refresh token for that user is revoked,
   * forcing a fresh login on all devices.
   */
  async refresh(rawToken: string, meta: RequestMeta = {}): Promise<AuthPayload> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) {
      await this.audit.log({
        action: AuditAction.REFRESH_FAILURE,
        success: false,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { reason: 'token not found' },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revoked) {
      // Reuse of a rotated-out token. Nuke the whole session family.
      await this.audit.log({
        userId: stored.userId,
        action: AuditAction.REFRESH_REUSE_DETECTED,
        success: false,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { refreshTokenId: stored.id },
      });
      await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException(
        'Refresh token reuse detected. All sessions have been revoked — please log in again.',
      );
    }

    if (stored.expiresAt < new Date()) {
      await this.audit.log({
        userId: stored.userId,
        action: AuditAction.REFRESH_FAILURE,
        success: false,
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: { reason: 'token expired' },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    const { user } = stored;
    const newTokens = await this.issueTokenPair(user.id, user.username, user.role, meta);

    // Rotate: mark the presented token as spent, linking it to its
    // replacement so a reuse attempt can be traced.
    const newHash = this.hashToken(newTokens.refreshToken);
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true, revokedAt: new Date(), replacedByTokenHash: newHash },
    });

    await this.audit.log({
      userId: user.id,
      action: AuditAction.REFRESH_SUCCESS,
      success: true,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return newTokens;
  }

  /** Revokes one session (the refresh token) and blacklists its current access token. */
  async logout(
    rawRefreshToken: string,
    userId?: string,
    accessJti?: string,
    accessExpSeconds?: number,
    meta: RequestMeta = {},
  ) {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });

    if (accessJti && accessExpSeconds) {
      const ttl = Math.max(accessExpSeconds - Math.floor(Date.now() / 1000), 1);
      await this.redis.set(`bl:${accessJti}`, '1', ttl);
    }

    await this.audit.log({
      userId,
      action: AuditAction.LOGOUT,
      success: true,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return true;
  }

  /** Revokes every refresh token for a user — "log out everywhere". */
  async revokeAllForUser(userId: string, meta: RequestMeta = {}) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });

    await this.audit.log({
      userId,
      action: AuditAction.LOGOUT_ALL_DEVICES,
      success: true,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return true;
  }

  private async issueTokenPair(
    sub: string,
    username: string,
    role: Role,
    meta: RequestMeta,
  ): Promise<AuthPayload> {
    const jti = crypto.randomUUID();
    const accessExpiresIn = this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN') ?? '15m';
    const accessToken = this.jwt.sign({ sub, username, role, jti }, { expiresIn: accessExpiresIn });

    const rawRefreshToken = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const refreshDays = Number(this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN_DAYS') ?? '30');
    const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(rawRefreshToken),
        userId: sub,
        expiresAt,
        createdByIp: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken, id: sub, username, role };
  }

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}