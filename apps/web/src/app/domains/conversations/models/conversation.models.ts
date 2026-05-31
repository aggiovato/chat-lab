import { User } from '../../auth/models/auth.models';

export type ConversationType = 'DIRECT' | 'GROUP' | 'CHANNEL';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface ConversationMember {
  id: string;
  userId: string;
  conversationId: string;
  role: MemberRole;
  joinedAt: string;
  muted: boolean;
  archived: boolean;
  user: User;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string | null;
  imageUrl: string | null;
  members: ConversationMember[];
  createdAt: string;
  updatedAt: string;
}
