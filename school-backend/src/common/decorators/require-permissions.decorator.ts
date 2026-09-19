import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// User-er j-kono ekta permission thakleo pass — @Roles decorator er
// OR-style logic er shathe consistent.
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);