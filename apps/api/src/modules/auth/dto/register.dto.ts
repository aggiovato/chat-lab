import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  displayName?: string;

  @IsString()
  @MinLength(8)
  password: string;
}
