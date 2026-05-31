import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Socket } from 'socket.io';
import type { User } from '@prisma/client';
import { TokenService } from '../../auth/services/token.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class SocketAuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  async authenticate(socket: Socket): Promise<User> {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException('No token provided');

    const payload = this.tokenService.verifyAccess(token);
    return this.usersService.findByIdOrThrow(payload.sub);
  }
}
