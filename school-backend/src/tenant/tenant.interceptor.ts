import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tenantStorage, TenantStore } from './tenant-context';

// Runs after the auth guards, so req.user is already filled in. It puts
// the caller's institution into AsyncLocalStorage; the Prisma extension
// (tenant-extension.ts) reads it from there for every query.
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req =
      context.getType<string>() === 'graphql'
        ? GqlExecutionContext.create(context).getContext().req
        : context.switchToHttp().getRequest();

    const user = req?.user;
    const store: TenantStore = {
      institutionId: user?.institutionId ?? undefined,
      isSuperAdmin: user?.role === 'SUPER_ADMIN',
      anonymous: !user,
    };

    // next.handle() is lazy, so it must be subscribed inside run() for
    // the handler (and every await inside it) to see the store.
    return new Observable((subscriber) => {
      tenantStorage.run(store, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}