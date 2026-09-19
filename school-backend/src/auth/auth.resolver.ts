import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

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

// Roles a stranger off the street can self-register as. Everything
// else (ADMIN, ACCOUNTANT, LIBRARIAN, PRINCIPAL) must go through
// createStaffAccount below, which only an existing admin can call.
const PUBLIC_SIGNUP_ROLES: Role[] = [Role.PARENT]; // teachers are created by an admin (createStaffAccount)
const STAFF_ACCOUNT_ROLES: Role[] = [Role.ADMIN, Role.ACCOUNTANT, Role.LIBRARIAN, Role.PRINCIPAL, Role.TEACHER, Role.TRANSPORT_STAFF];

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  @Throttle(AUTH_THROTTLE)
  register(@Args('input') input: RegisterInput, @ReqMeta() meta: RequestMeta) {
    if (!PUBLIC_SIGNUP_ROLES.includes(input.role)) {
      throw new BadRequestException(
        'This role cannot self-register. Ask an admin to create the account.',
      );
    }
    return this.authService.register(input, meta);
  }

  @Mutation(() => AuthPayload)
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createStaffAccount(@Args('input') input: RegisterInput, @ReqMeta() meta: RequestMeta) {
    if (!STAFF_ACCOUNT_ROLES.includes(input.role)) {
      throw new BadRequestException(
        `Role ${input.role} cannot be created this way.`,
      );
    }
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
    @CurrentUser() user: { id: string; jti: string; exp: number },
    @ReqMeta() meta: RequestMeta,
  ) {
    return this.authService.logout(input.refreshToken, user.id, user.jti, user.exp, meta);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  logoutAllDevices(@CurrentUser() user: { id: string }) {
    return this.authService.revokeAllForUser(user.id);
  }
}