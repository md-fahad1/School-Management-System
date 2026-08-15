import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { PasswordResetService } from './password-reset.service';
import { EmailVerificationService } from './email-verification.service';
import {
  RequestPasswordResetInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ResendVerificationInput,
} from './dto/password-reset.dto';
import { ReqMeta, RequestMeta } from '../common/decorators/req-meta.decorator';

// Same tight limit as login/register — these send emails and touch
// tokens, so they're just as attractive a target for abuse (e.g.
// spamming someone's inbox with reset emails).
const SENSITIVE_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@Resolver()
export class AccountResolver {
  constructor(
    private passwordReset: PasswordResetService,
    private emailVerification: EmailVerificationService,
  ) {}

  @Mutation(() => Boolean)
  @Throttle(SENSITIVE_THROTTLE)
  requestPasswordReset(@Args('input') input: RequestPasswordResetInput, @ReqMeta() meta: RequestMeta) {
    return this.passwordReset.requestReset(input.email, meta);
  }

  @Mutation(() => Boolean)
  @Throttle(SENSITIVE_THROTTLE)
  resetPassword(@Args('input') input: ResetPasswordInput, @ReqMeta() meta: RequestMeta) {
    return this.passwordReset.resetPassword(input.token, input.newPassword, meta);
  }

  @Mutation(() => Boolean)
  @Throttle(SENSITIVE_THROTTLE)
  verifyEmail(@Args('input') input: VerifyEmailInput, @ReqMeta() meta: RequestMeta) {
    return this.emailVerification.verifyEmail(input.token, meta);
  }

  @Mutation(() => Boolean)
  @Throttle(SENSITIVE_THROTTLE)
  resendVerificationEmail(@Args('input') input: ResendVerificationInput, @ReqMeta() meta: RequestMeta) {
    return this.emailVerification.resendVerification(input.email, meta);
  }
}