import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class LoginAttemptsService {
  constructor(
    private redis: RedisService,
    private config: ConfigService,
  ) {}

  private key(username: string): string {
    return `login-attempts:${username.toLowerCase()}`;
  }

  private lockKey(username: string): string {
    return `login-locked:${username.toLowerCase()}`;
  }

  private get maxAttempts(): number {
    return Number(this.config.get<string>('LOGIN_LOCKOUT_MAX_ATTEMPTS') ?? '5');
  }

  private get lockoutMinutes(): number {
    return Number(this.config.get<string>('LOGIN_LOCKOUT_MINUTES') ?? '15');
  }

  private get attemptsWindowMinutes(): number {
    // Failed attempts stop counting against you after this long, so an
    // account isn't locked out forever by attempts scattered days apart.
    return Number(this.config.get<string>('LOGIN_ATTEMPTS_WINDOW_MINUTES') ?? '15');
  }

  /** Seconds remaining on an active lockout, or null if not locked. */
  async getLockoutRemaining(username: string): Promise<number | null> {
    const ttl = await this.redis.ttl(this.lockKey(username));
    return ttl > 0 ? ttl : null;
  }

  /**
   * Records a failed attempt. Returns the lockout duration in seconds
   * if this failure just tipped the account into a lockout, or null if
   * it didn't (still under the threshold).
   */
  async recordFailure(username: string): Promise<number | null> {
    const key = this.key(username);
    const attempts = await this.redis.incr(key);

    if (attempts === 1) {
      await this.redis.expire(key, this.attemptsWindowMinutes * 60);
    }

    if (attempts >= this.maxAttempts) {
      const lockSeconds = this.lockoutMinutes * 60;
      await this.redis.set(this.lockKey(username), '1', lockSeconds);
      await this.redis.del(key);
      return lockSeconds;
    }

    return null;
  }

  /** Called on successful login — clears any accumulated failure count. */
  async recordSuccess(username: string): Promise<void> {
    await this.redis.del(this.key(username));
  }
}