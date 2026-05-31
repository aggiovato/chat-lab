import { IsArray, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateGroupConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  title?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @MinLength(1)
  memberIds: string[];
}
