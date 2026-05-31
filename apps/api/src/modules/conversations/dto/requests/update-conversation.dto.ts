import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  title?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
