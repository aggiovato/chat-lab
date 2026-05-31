import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ConversationsService } from '../../conversations/services/conversations.service';
import { SendMessageDto } from '../dto/requests/send-message.dto';
import { UpdateMessageDto } from '../dto/requests/update-message.dto';
import { MessageListQueryDto } from '../dto/requests/message-list-query.dto';

const messageInclude = {
  sender: true,
  reactions: { include: { user: true } },
  readReceipts: { include: { user: true } },
  attachments: true,
} satisfies Prisma.MessageInclude;

export type MessageWithRelations = Prisma.MessageGetPayload<{
  include: typeof messageInclude;
}>;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationsService: ConversationsService,
  ) {}

  async findAll(conversationId: string, userId: string, query: MessageListQueryDto): Promise<MessageWithRelations[]> {
    await this.conversationsService.assertMember(conversationId, userId);

    return this.prisma.message.findMany({
      where: { conversationId },
      include: messageInclude,
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 50,
      // Cursor-based pagination: skip the cursor message and fetch older ones
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
    });
  }

  async findById(id: string): Promise<MessageWithRelations | null> {
    return this.prisma.message.findUnique({ where: { id }, include: messageInclude });
  }

  async findByIdOrThrow(id: string): Promise<MessageWithRelations> {
    const message = await this.findById(id);
    if (!message) throw new NotFoundException(`Message ${id} not found`);
    return message;
  }

  async send(senderId: string, conversationId: string, dto: SendMessageDto): Promise<MessageWithRelations> {
    await this.conversationsService.assertMember(conversationId, senderId);

    // Commands are handled by CommandsModule — plain content defaults to TEXT
    const type = dto.type ?? (dto.content?.startsWith('/') ? MessageType.COMMAND : MessageType.TEXT);

    return this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        type,
        content: dto.content,
        replyToId: dto.replyToId,
      },
      include: messageInclude,
    });
  }

  async update(userId: string, messageId: string, dto: UpdateMessageDto): Promise<MessageWithRelations> {
    const message = await this.findByIdOrThrow(messageId);

    if (message.senderId !== userId) throw new ForbiddenException('You can only edit your own messages');
    if (message.deletedAt) throw new ForbiddenException('Cannot edit a deleted message');

    return this.prisma.message.update({
      where: { id: messageId },
      data: { content: dto.content, editedAt: new Date() },
      include: messageInclude,
    });
  }

  async softDelete(userId: string, messageId: string): Promise<void> {
    const message = await this.findByIdOrThrow(messageId);

    if (message.senderId !== userId) throw new ForbiddenException('You can only delete your own messages');

    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }
}
