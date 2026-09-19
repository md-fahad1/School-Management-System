import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { DEFAULT_ROLE_PERMISSIONS } from '../common/constants/permissions.constant';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  // Custom role thakle DB-e store kora permission set use hoy;
  // na thakle legacy Role enum-er default set fallback hishebe use hoy —
  // tai kono user-ke custom role assign na korle o shob purono @Roles
  // guard normal moto e kaj korte thakbe, kichu bhangbe na.
  async getPermissionsForUser(userId: string, role: Role): Promise<Set<string>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        customRoleId: true,
        customRole: {
          select: { permissions: { select: { permission: { select: { key: true } } } } },
        },
        userPermissions: { select: { granted: true, permission: { select: { key: true } } } },
      },
    });

    const base = new Set<string>(
      user?.customRoleId
        ? (user.customRole?.permissions.map((rp) => rp.permission.key) ?? [])
        : (DEFAULT_ROLE_PERMISSIONS[role] ?? []),
    );

    // Per-user override layer — granted:true extra permission add kore,
    // granted:false base-e thaka kono permission revoke kore.
    for (const up of user?.userPermissions ?? []) {
      if (up.granted) base.add(up.permission.key);
      else base.delete(up.permission.key);
    }

    return base;
  }

  async hasAnyPermission(userId: string, role: Role, keys: string[]): Promise<boolean> {
    if (keys.length === 0) return true;
    const permissions = await this.getPermissionsForUser(userId, role);
    return keys.some((k) => permissions.has(k));
  }
}