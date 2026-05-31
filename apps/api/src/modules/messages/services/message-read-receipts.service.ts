import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

const receiptInclude = { user: true } satisfies Prisma.MessageReadReceiptInclude;

export type ReceiptWithUser = Prisma.MessageReadReceiptGetPayload<{
  include: typeof receiptInclude;
}>;

@Injectable()
export class MessageReadReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async markRead(userId: string, messageId: string): Promise<ReceiptWithUser> {
    // upsert ensures a user can only have one receipt per message
    return this.prisma.messageReadReceipt.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId },
      update: { readAt: new Date() },
      include: receiptInclude,
    });
  }

  async findByMessage(messageId: string): Promise<ReceiptWithUser[]> {
    return this.prisma.messageReadReceipt.findMany({
      where: { messageId },
      include: receiptInclude,
    });
  }

  async hasRead(userId: string, messageId: string): Promise<boolean> {
    const receipt = await this.prisma.messageReadReceipt.findUnique({
      where: { messageId_userId: { messageId, userId } },
    });
    return !!receipt;
  }
}
