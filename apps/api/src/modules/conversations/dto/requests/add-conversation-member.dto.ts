import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MemberRole } from '@prisma/client';

export class AddConversationMemberDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole;
}
