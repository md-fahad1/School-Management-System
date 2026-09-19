import { AsyncLocalStorage } from 'async_hooks';
import { BadRequestException } from '@nestjs/common';

export interface TenantStore {
  institutionId?: string;
  isSuperAdmin: boolean;
  anonymous: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

export const getTenant = (): TenantStore | undefined => tenantStorage.getStore();

export const requireInstitutionId = (): string => {
  const id = getTenant()?.institutionId;
  if (!id) {
    throw new BadRequestException('This action needs an institution context');
  }
  return id;
};