import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RegisterDto } from '../dto/requests/register.dto';
import { LoginDto } from '../dto/requests/login.dto';
import { RefreshTokenDto } from '../dto/requests/refresh-token.dto';
import { AuthResponseDto } from '../dto/responses/auth-response.dto';
import { UserResponseDto } from '../../users/dto/responses/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): UserResponseDto {
    return new UserResponseDto(user);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(): { message: string } {
    return { message: 'Sesión cerrada' };
  }
}
