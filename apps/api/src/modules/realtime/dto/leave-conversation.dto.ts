import { IsUUID } from 'class-validator';

export class LeaveConversationDto {
  @IsUUID()
  conversationId: string;
}
