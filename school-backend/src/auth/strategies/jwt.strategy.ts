import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  jti: string;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private redis: RedisService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_SECRET is not set. Make sure a .env file exists in the project root ' +
          '(copy .env.example to .env) and defines JWT_SECRET.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // Access tokens are stateless by design, but logout needs to be able
    // to kill one immediately rather than waiting out its (short) natural
    // expiry — so every request checks a Redis blacklist keyed by jti.
    const blacklisted = await this.redis.exists(`bl:${payload.jti}`);
    if (blacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Attached to req.user; kept minimal since resolvers can fetch
    // full profile data via the users/teachers/students services.
    // jti + exp are carried through so the logout mutation can
    // blacklist *this specific* access token.
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}