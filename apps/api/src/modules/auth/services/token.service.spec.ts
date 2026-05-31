import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [TokenService],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signAccess / verifyAccess', () => {
    it('should sign and verify an access token', () => {
      const payload = { sub: 'uuid-1' };
      const token = service.signAccess(payload);
      const decoded = service.verifyAccess(token);
      expect(decoded.sub).toBe('uuid-1');
    });

    it('should throw UnauthorizedException for an invalid access token', () => {
      expect(() => service.verifyAccess('invalid.token.here')).toThrow(UnauthorizedException);
    });
  });

  describe('signRefresh / verifyRefresh', () => {
    it('should sign and verify a refresh token', () => {
      const payload = { sub: 'uuid-1' };
      const token = service.signRefresh(payload);
      const decoded = service.verifyRefresh(token);
      expect(decoded.sub).toBe('uuid-1');
    });

    it('should throw UnauthorizedException for an invalid refresh token', () => {
      expect(() => service.verifyRefresh('invalid.token.here')).toThrow(UnauthorizedException);
    });

    it('should produce different tokens for access and refresh', () => {
      const payload = { sub: 'uuid-1' };
      const access = service.signAccess(payload);
      const refresh = service.signRefresh(payload);
      expect(access).not.toBe(refresh);
    });
  });
});
