import type { ConversationMember, User } from '@prisma/client';
import { MemberRole } from '@prisma/client';
import { UserResponseDto } from '../../../users/dto/responses/user-response.dto';

export class ConversationMemberResponseDto {
  id: string;
  userId: string;
  conversationId: string;
  role: MemberRole;
  joinedAt: Date;
  muted: boolean;
  archived: boolean;
  user: UserResponseDto;

  constructor(member: ConversationMember & { user: User }) {
    this.id = member.id;
    this.userId = member.userId;
    this.conversationId = member.conversationId;
    this.role = member.role;
    this.joinedAt = member.joinedAt;
    this.muted = member.muted;
    this.archived = member.archived;
    this.user = new UserResponseDto(member.user);
  }
}
