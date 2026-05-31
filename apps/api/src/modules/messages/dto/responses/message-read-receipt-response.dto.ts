import type { MessageReadReceipt, User } from '@prisma/client';
import { UserResponseDto } from '../../../users/dto/responses/user-response.dto';

export class MessageReadReceiptResponseDto {
  id: string;
  messageId: string;
  userId: string;
  readAt: Date;
  user: UserResponseDto;

  constructor(receipt: MessageReadReceipt & { user: User }) {
    this.id = receipt.id;
    this.messageId = receipt.messageId;
    this.userId = receipt.userId;
    this.readAt = receipt.readAt;
    this.user = new UserResponseDto(receipt.user);
  }
}
