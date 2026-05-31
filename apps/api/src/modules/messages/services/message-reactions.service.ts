import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

const reactionInclude = { user: true } satisfies Prisma.MessageReactionInclude;

export type ReactionWithUser = Prisma.MessageReactionGetPayload<{
  include: typeof reactionInclude;
}>;

@Injectable()
export class MessageReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, messageId: string, emoji: string): Promise<ReactionWithUser> {
    // upsert avoids duplicate reaction errors for the same (message, user, emoji)
    return this.prisma.messageReaction.upsert({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
      create: { messageId, userId, emoji },
      update: {},
      include: reactionInclude,
    });
  }

  async remove(userId: string, messageId: string, emoji: string): Promise<void> {
    await this.prisma.messageReaction.deleteMany({
      where: { messageId, userId, emoji },
    });
  }

  async findByMessage(messageId: string): Promise<ReactionWithUser[]> {
    return this.prisma.messageReaction.findMany({
      where: { messageId },
      include: reactionInclude,
    });
  }
}
