import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { UsersService } from '../../users/services/users.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const emailTaken = await this.usersService.findByEmail(dto.email);
    if (emailTaken) throw new ConflictException('El email ya está registrado');

    const usernameTaken = await this.usersService.findByUsername(dto.username);
    if (usernameTaken) throw new ConflictException('El username ya está en uso');

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      displayName: dto.displayName,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await this.passwordService.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const payload = this.tokenService.verifyRefresh(dto.refreshToken);
    const user = await this.usersService.findByIdOrThrow(payload.sub);
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User): AuthResponseDto {
    const payload = { sub: user.id };
    return new AuthResponseDto(
      this.tokenService.signAccess(payload),
      this.tokenService.signRefresh(payload),
      new UserResponseDto(user),
    );
  }
}
