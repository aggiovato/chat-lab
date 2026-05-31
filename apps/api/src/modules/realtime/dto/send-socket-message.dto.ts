import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { MessageType } from '@prisma/client';

export class SendSocketMessageDto {
  @IsUUID()
  conversationId: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
