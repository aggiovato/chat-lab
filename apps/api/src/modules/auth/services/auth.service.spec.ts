import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { AuthResponseDto } from '../dto/responses/auth-response.dto';

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  passwordHash: 'hashed',
  avatarUrl: null,
  status: UserStatus.OFFLINE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const usersServiceMock = {
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findByIdOrThrow: jest.fn(),
  create: jest.fn(),
};

const passwordServiceMock = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const tokenServiceMock = {
  signAccess: jest.fn().mockReturnValue('access-token'),
  signRefresh: jest.fn().mockReturnValue('refresh-token'),
  verifyRefresh: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: PasswordService, useValue: passwordServiceMock },
        { provide: TokenService, useValue: tokenServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    tokenServiceMock.signAccess.mockReturnValue('access-token');
    tokenServiceMock.signRefresh.mockReturnValue('refresh-token');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a user and return AuthResponseDto', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      usersServiceMock.findByUsername.mockResolvedValue(null);
      passwordServiceMock.hash.mockResolvedValue('hashed');
      usersServiceMock.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw ConflictException if email is taken', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'test@example.com', username: 'other', password: 'pass1234' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username is taken', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      usersServiceMock.findByUsername.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'other@example.com', username: 'testuser', password: 'pass1234' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return AuthResponseDto for valid credentials', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(mockUser);
      passwordServiceMock.compare.mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nope@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(mockUser);
      passwordServiceMock.compare.mockResolvedValue(false);
      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new AuthResponseDto for a valid refresh token', async () => {
      tokenServiceMock.verifyRefresh.mockReturnValue({ sub: 'uuid-1' });
      usersServiceMock.findByIdOrThrow.mockResolvedValue(mockUser);

      const result = await service.refresh({ refreshToken: 'valid-refresh-token' });

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe('access-token');
    });

    it('should propagate UnauthorizedException from TokenService', async () => {
      tokenServiceMock.verifyRefresh.mockImplementation(() => {
        throw new UnauthorizedException();
      });
      await expect(service.refresh({ refreshToken: 'invalid' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
