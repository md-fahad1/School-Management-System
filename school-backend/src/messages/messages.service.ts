import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageInput } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // Everything a user is party to (sent or received), newest first.
  inbox(userId: string, skip = 0, take = 20) {
    return this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      skip,
      take,
      orderBy: { sentAt: 'desc' },
    });
  }

  // Thread between the current user and one specific other user.
  conversation(userId: string, otherUserId: string, skip = 0, take = 50) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      skip,
      take,
      orderBy: { sentAt: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException(`Message ${id} not found`);
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('You do not have access to this message');
    }
    return message;
  }

  async send(input: SendMessageInput, senderId: string) {
    const receiver = await this.prisma.user.findUnique({ where: { id: input.receiverId } });
    if (!receiver) throw new NotFoundException('Recipient not found');

    return this.prisma.message.create({
      data: { content: input.content, senderId, receiverId: input.receiverId },
    });
  }

  async markRead(id: string, userId: string) {
    const message = await this.findOne(id, userId);
    if (message.receiverId !== userId) {
      throw new ForbiddenException('Only the recipient can mark a message as read');
    }
    return this.prisma.message.update({ where: { id }, data: { read: true } });
  }

  async remove(id: string, userId: string) {
    const message = await this.findOne(id, userId);
    if (message.senderId !== userId) {
      throw new ForbiddenException('Only the sender can delete a message');
    }
    await this.prisma.message.delete({ where: { id } });
    return true;
  }
}
