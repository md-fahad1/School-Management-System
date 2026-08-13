import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export const ReqMeta = createParamDecorator(
  (data: unknown, context: ExecutionContext): RequestMeta => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return { ip, userAgent };
  },
);