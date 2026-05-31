import { IsString, MinLength } from 'class-validator';

export class UserSearchQueryDto {
  @IsString()
  @MinLength(2)
  query?: string;
}
