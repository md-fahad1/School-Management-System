import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  AuthPayload,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
} from './dto/auth.dto';
import { ReqMeta, RequestMeta } from '../common/decorators/req-meta.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';

// Much tighter than the app-wide default (60 req/min) — these are the
// endpoints brute-force and credential-stuffing attacks actually hit.
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  @Throttle(AUTH_THROTTLE)
  register(@Args('input') input: RegisterInput, @ReqMeta() meta: RequestMeta) {
    return this.authService.register(input, meta);
  }

  @Mutation(() => AuthPayload)
  @Throttle(AUTH_THROTTLE)
  login(@Args('input') input: LoginInput, @ReqMeta() meta: RequestMeta) {
    return this.authService.login(input, meta);
  }

  @Mutation(() => AuthPayload)
  @Throttle(AUTH_THROTTLE)
  refreshToken(@Args('input') input: RefreshTokenInput, @ReqMeta() meta: RequestMeta) {
    return this.authService.refresh(input.refreshToken, meta);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  logout(
    @Args('input') input: LogoutInput,
    @CurrentUser() user: { jti: string; exp: number },
  ) {
    return this.authService.logout(input.refreshToken, user.jti, String(user.exp));
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  logoutAllDevices(@CurrentUser() user: { id: string }) {
    return this.authService.revokeAllForUser(user.id);
  }
}