import type { Message, MessageAttachment, MessageReaction, MessageReadReceipt, User } from '@prisma/client';
import { MessageType } from '@prisma/client';
import { UserResponseDto } from '../../../users/dto/responses/user-response.dto';
import { MessageReactionResponseDto } from './message-reaction-response.dto';
import { MessageReadReceiptResponseDto } from './message-read-receipt-response.dto';

type MessageWithRelations = Message & {
  sender: User | null;
  reactions: (MessageReaction & { user: User })[];
  readReceipts: (MessageReadReceipt & { user: User })[];
  attachments: MessageAttachment[];
};

export class MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string | null;
  sender: UserResponseDto | null;
  type: MessageType;
  content: string | null;
  commandName: string | null;
  replyToId: string | null;
  reactions: MessageReactionResponseDto[];
  readReceipts: MessageReadReceiptResponseDto[];
  attachmentCount: number;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(message: MessageWithRelations) {
    this.id = message.id;
    this.conversationId = message.conversationId;
    this.senderId = message.senderId;
    this.sender = message.sender ? new UserResponseDto(message.sender) : null;
    this.type = message.type;
    // Hide content of soft-deleted messages
    this.content = message.deletedAt ? null : message.content;
    this.commandName = message.commandName;
    this.replyToId = message.replyToId;
    this.reactions = message.reactions.map((r) => new MessageReactionResponseDto(r));
    this.readReceipts = message.readReceipts.map((r) => new MessageReadReceiptResponseDto(r));
    this.attachmentCount = message.attachments.length;
    this.editedAt = message.editedAt;
    this.deletedAt = message.deletedAt;
    this.createdAt = message.createdAt;
    this.updatedAt = message.updatedAt;
  }
}
