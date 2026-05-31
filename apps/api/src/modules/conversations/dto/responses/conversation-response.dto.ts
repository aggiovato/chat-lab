import type { Conversation, ConversationMember, User } from '@prisma/client';
import { ConversationType } from '@prisma/client';
import { ConversationMemberResponseDto } from './conversation-member-response.dto';

export class ConversationResponseDto {
  id: string;
  type: ConversationType;
  title: string | null;
  imageUrl: string | null;
  members: ConversationMemberResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  constructor(conversation: Conversation & { members: (ConversationMember & { user: User })[] }) {
    this.id = conversation.id;
    this.type = conversation.type;
    this.title = conversation.title;
    this.imageUrl = conversation.imageUrl;
    this.members = conversation.members.map((m) => new ConversationMemberResponseDto(m));
    this.createdAt = conversation.createdAt;
    this.updatedAt = conversation.updatedAt;
  }
}
