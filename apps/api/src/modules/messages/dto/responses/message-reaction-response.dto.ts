import type { MessageReaction, User } from '@prisma/client';
import { UserResponseDto } from '../../../users/dto/responses/user-response.dto';

export class MessageReactionResponseDto {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
  user: UserResponseDto;

  constructor(reaction: MessageReaction & { user: User }) {
    this.id = reaction.id;
    this.messageId = reaction.messageId;
    this.userId = reaction.userId;
    this.emoji = reaction.emoji;
    this.createdAt = reaction.createdAt;
    this.user = new UserResponseDto(reaction.user);
  }
}
