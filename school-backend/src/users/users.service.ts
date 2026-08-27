import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}