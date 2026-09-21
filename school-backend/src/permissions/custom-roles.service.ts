import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { PermissionsService } from './permissions.service';
import { CreateCustomRoleInput, UpdateCustomRoleInput, AssignUserRoleInput, SetUserPermissionInput } from './dto/permission.dto';

@Injectable()
export class CustomRolesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private permissionsService: PermissionsService,
  ) {}

  listPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { action: 'asc' }] });
  }

  listCustomRoles() {
    return this.prisma.customRole.findMany({
      orderBy: { name: 'asc' },
      include: { permissions: { include: { permission: true } } },
    }).then((roles) => roles.map(this.mapRole));
  }

  async findOne(id: string) {
    const role = await this.prisma.customRole.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return this.mapRole(role);
  }

  private mapRole(role: any) {
    return { ...role, permissions: role.permissions.map((rp: any) => rp.permission) };
  }

  async create(input: CreateCustomRoleInput, actorId?: string) {
    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: input.permissionKeys } },
    });
    const created = await this.prisma.customRole.create({
      data: {
        name: input.name,
        description: input.description,
        permissions: { create: permissions.map((p) => ({ permissionId: p.id })) },
      },
      include: { permissions: { include: { permission: true } } },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ROLE_CREATE,
      success: true,
      metadata: { roleId: created.id, name: created.name, permissionKeys: input.permissionKeys },
    });

    return this.mapRole(created);
  }

  async update(id: string, input: UpdateCustomRoleInput, actorId?: string) {
        const existing = await this.findOne(id);
    if (existing.isSystem) {
      throw new BadRequestException(
        'System roles are read-only — clone it into a new custom role instead.',
      );
    }
    if (existing.isSystem && input.permissionKeys) {
      // System role-er naam bodlano jabe na, kintu permission set
      // dorkar hole admin ke edit korte dilam — full lock kora holo na
      // karon shurute default set thik na o hote pare.
    }

    if (input.permissionKeys) {
      const permissions = await this.prisma.permission.findMany({
        where: { key: { in: input.permissionKeys } },
      });
      await this.prisma.customRolePermission.deleteMany({ where: { customRoleId: id } });
      await this.prisma.customRolePermission.createMany({
        data: permissions.map((p) => ({ customRoleId: id, permissionId: p.id })),
      });
    }

    const updated = await this.prisma.customRole.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
      },
      include: { permissions: { include: { permission: true } } },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ROLE_UPDATE,
      success: true,
      metadata: { roleId: id, permissionKeys: input.permissionKeys },
    });

    return this.mapRole(updated);
  }

  async remove(id: string, actorId?: string) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted — clone it into a new custom role instead.');
    }
    await this.prisma.customRole.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.ROLE_DELETE,
      success: true,
      metadata: { roleId: id, name: role.name },
    });

    return true;
  }

  // Every account in the institution with its base role and assigned custom role.
  async listUserAccess(search?: string) {
    const users = await this.prisma.user.findMany({
      where: search ? { username: { contains: search, mode: 'insensitive' } } : {},
      take: 200,
      orderBy: { username: 'asc' },
      select: {
        id: true,
        username: true,
        role: true,
        customRoleId: true,
        customRole: { select: { name: true } },
      },
    });
    return users.map((u) => ({
      userId: u.id,
      username: u.username,
      baseRole: u.role,
      customRoleId: u.customRoleId,
      customRoleName: u.customRole?.name ?? null,
    }));
  }

  async getUserAccess(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        customRoleId: true,
        customRole: { select: { name: true } },
        userPermissions: { select: { granted: true, permission: { select: { key: true } } } },
      },
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const effective = await this.permissionsService.getPermissionsForUser(user.id, user.role);

    return {
      userId: user.id,
      username: user.username,
      baseRole: user.role,
      customRoleId: user.customRoleId,
      customRoleName: user.customRole?.name ?? null,
      overrides: user.userPermissions.map((up) => ({
        permissionKey: up.permission.key,
        granted: up.granted,
      })),
      effectivePermissions: Array.from(effective).sort(),
    };
  }

  // Puts a permission back to "inherit from the role" (deletes the override).
  async removeUserPermission(userId: string, permissionKey: string, actorId?: string) {
    const permission = await this.prisma.permission.findUnique({ where: { key: permissionKey } });
    if (!permission) throw new NotFoundException(`Permission ${permissionKey} not found`);

    // The tenant extension scopes UserPermission through its user, so this can
    // only ever touch users of the admin's own institution.
    await this.prisma.userPermission.deleteMany({
      where: { userId, permissionId: permission.id },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.USER_PERMISSION_OVERRIDE_SET,
      success: true,
      metadata: { targetUserId: userId, permissionKey, removed: true },
    });

    return true;
  }

  async assignUserRole(input: AssignUserRoleInput, actorId?: string) {
    const updated = await this.prisma.user.update({
      where: { id: input.userId },
      data: { customRoleId: input.customRoleId ?? null },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.USER_ROLE_ASSIGNED,
      success: true,
      metadata: { targetUserId: input.userId, customRoleId: input.customRoleId ?? null },
    });

    return updated;
  }

  async setUserPermission(input: SetUserPermissionInput, actorId?: string) {
    const permission = await this.prisma.permission.findUnique({ where: { key: input.permissionKey } });
    if (!permission) throw new NotFoundException(`Permission ${input.permissionKey} not found`);

    await this.prisma.userPermission.upsert({
      where: { userId_permissionId: { userId: input.userId, permissionId: permission.id } },
      update: { granted: input.granted },
      create: { userId: input.userId, permissionId: permission.id, granted: input.granted },
    });

    await this.auditService.log({
      userId: actorId,
      action: AuditAction.USER_PERMISSION_OVERRIDE_SET,
      success: true,
      metadata: { targetUserId: input.userId, permissionKey: input.permissionKey, granted: input.granted },
    });

    return true;
  }
}