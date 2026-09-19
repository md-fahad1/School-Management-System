import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantExtension } from '../tenant/tenant-extension';

// Every query made through this service is automatically limited to the
// logged-in user's institution (see tenant-extension.ts). The client
// connects lazily on its first query, so no lifecycle hooks are needed.
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
    return this.$extends(tenantExtension()) as unknown as this;
  }
}