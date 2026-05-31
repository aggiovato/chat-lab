import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { SocketAuthService } from './socket-auth.service';
import { TokenService } from '../../auth/services/token.service';
import { UsersService } from '../../users/services/users.service';

const mockUser = {
  id: 'user-1', email: 'a@example.com', username: 'u', displayName: null,
  passwordHash: 'h', avatarUrl: null, status: UserStatus.OFFLINE,
  createdAt: new Date(), updatedAt: new Date(),
};

const tokenServiceMock = { verifyAccess: jest.fn() };
const usersServiceMock = { findByIdOrThrow: jest.fn() };

describe('SocketAuthService', () => {
  let service: SocketAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocketAuthService,
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    service = module.get<SocketAuthService>(SocketAuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    it('should return the user for a valid token in handshake.auth', async () => {
      const socket = { handshake: { auth: { token: 'valid-token' }, headers: {} } } as any;
      tokenServiceMock.verifyAccess.mockReturnValue({ sub: 'user-1' });
      usersServiceMock.findByIdOrThrow.mockResolvedValue(mockUser);

      const result = await service.authenticate(socket);
      expect(result).toEqual(mockUser);
      expect(tokenServiceMock.verifyAccess).toHaveBeenCalledWith('valid-token');
    });

    it('should extract token from Authorization header', async () => {
      const socket = { handshake: { auth: {}, headers: { authorization: 'Bearer header-token' } } } as any;
      tokenServiceMock.verifyAccess.mockReturnValue({ sub: 'user-1' });
      usersServiceMock.findByIdOrThrow.mockResolvedValue(mockUser);

      await service.authenticate(socket);
      expect(tokenServiceMock.verifyAccess).toHaveBeenCalledWith('header-token');
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const socket = { handshake: { auth: {}, headers: {} } } as any;
      await expect(service.authenticate(socket)).rejects.toThrow(UnauthorizedException);
    });
  });
});
