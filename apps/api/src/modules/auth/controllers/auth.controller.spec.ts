import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { AuthResponseDto } from '../dto/responses/auth-response.dto';
import { UserResponseDto } from '../../users/dto/responses/user-response.dto';

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

const mockAuthResponse = new AuthResponseDto(
  'access-token',
  'refresh-token',
  new UserResponseDto(mockUser),
);

const authServiceMock = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should delegate to AuthService and return AuthResponseDto', async () => {
      authServiceMock.register.mockResolvedValue(mockAuthResponse);
      const dto = { email: 'test@example.com', username: 'testuser', password: 'password123' };
      const result = await controller.register(dto);
      expect(result).toBe(mockAuthResponse);
      expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should delegate to AuthService and return AuthResponseDto', async () => {
      authServiceMock.login.mockResolvedValue(mockAuthResponse);
      const dto = { email: 'test@example.com', password: 'password123' };
      const result = await controller.login(dto);
      expect(result).toBe(mockAuthResponse);
    });
  });

  describe('me', () => {
    it('should return a UserResponseDto without passwordHash', () => {
      const result = controller.me(mockUser);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe(mockUser.id);
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('should delegate to AuthService', async () => {
      authServiceMock.refresh.mockResolvedValue(mockAuthResponse);
      const result = await controller.refresh({ refreshToken: 'some-token' });
      expect(result).toBe(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should return a confirmation message', () => {
      const result = controller.logout();
      expect(result).toHaveProperty('message');
    });
  });
});
