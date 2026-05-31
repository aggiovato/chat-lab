import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccess(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
      expiresIn: '15m',
    });
  }

  signRefresh(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
      expiresIn: '7d',
    });
  }

  verifyAccess(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  verifyRefresh(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
