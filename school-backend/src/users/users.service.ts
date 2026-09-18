import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateAvatarInput,
  UpdateProfileInput,
  UpdateNotificationPreferencesInput,
} from './dto/update-profile.dto';

// Every role except STUDENT can reach the "my profile" screen today
// (student self-service isn't wired up in the UI yet, but the backend
// doesn't need to special-case it — same name/surname shape everywhere).
// Each of these Prisma delegates has a unique `userId` plus `name` and
// `surname` columns, which is all this service needs from them.
const ROLE_DELEGATE = {
  [Role.ADMIN]: 'admin',
  [Role.TEACHER]: 'teacher',
  [Role.STUDENT]: 'student',
  [Role.PARENT]: 'parent',
  [Role.ACCOUNTANT]: 'accountant',
  [Role.LIBRARIAN]: 'librarian',
  [Role.PRINCIPAL]: 'principal',
  [Role.TRANSPORT_STAFF]: 'transportStaff',
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllExcept(currentUserId: string, search?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        ...(search ? { username: { contains: search, mode: 'insensitive' } } : {}),
      },
      take: 200,
      orderBy: { username: 'asc' },
    });
    return users.map((u) => ({ id: u.id, username: u.username, roleName: u.role }));
  }

  private roleDelegate(role: Role) {
    const delegateName = ROLE_DELEGATE[role];
    return (this.prisma as any)[delegateName];
  }

  private async loadProfile(userId: string, role: Role) {
    const record = await this.roleDelegate(role).findUnique({
      where: { userId },
      select: { name: true, surname: true },
    });
    if (!record) {
      throw new NotFoundException('Profile record not found for this account');
    }
    return record as { name: string; surname: string };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { name, surname } = await this.loadProfile(userId, user.role);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
      img: user.img ?? undefined,
      emailNotifications: user.emailNotifications,
      name,
      surname,
    };
  }

  async updateProfile(userId: string, role: Role, input: UpdateProfileInput) {
    if (input.name === undefined && input.surname === undefined && input.phone === undefined) {
      return this.getMe(userId);
    }

    if (input.phone !== undefined) {
      const owner = await this.prisma.user.findFirst({
        where: { phone: input.phone, NOT: { id: userId } },
        select: { id: true },
      });
      if (owner) {
        throw new ConflictException('This phone number is already in use');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (input.name !== undefined || input.surname !== undefined) {
        await (tx as any)[ROLE_DELEGATE[role]].update({
          where: { userId },
          data: {
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.surname !== undefined ? { surname: input.surname } : {}),
          },
        });
      }
      if (input.phone !== undefined) {
        await tx.user.update({ where: { id: userId }, data: { phone: input.phone } });
      }
    });

    return this.getMe(userId);
  }

  async updateAvatar(userId: string, imageUrl: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { img: imageUrl } });
    return this.getMe(userId);
  }
    async updateNotificationPreferences(userId: string, input: UpdateNotificationPreferencesInput) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailNotifications: input.emailNotifications },
    });
    return this.getMe(userId);
  }
}