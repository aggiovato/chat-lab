import { IsString, MinLength } from 'class-validator';

export class AddMessageReactionDto {
  @IsString()
  @MinLength(1)
  emoji: string;
}
