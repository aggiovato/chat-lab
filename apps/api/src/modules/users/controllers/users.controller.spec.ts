import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

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
  findByIdOrThrow: jest.fn(),
  update: jest.fn(),
  search: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return a UserResponseDto from the current user', () => {
      const result = controller.getMe(mockUser);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe(mockUser.id);
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe('updateMe', () => {
    it('should update and return a UserResponseDto', async () => {
      const dto: UpdateUserDto = { displayName: 'Nuevo nombre' };
      usersServiceMock.update.mockResolvedValue({ ...mockUser, displayName: 'Nuevo nombre' });
      const result = await controller.updateMe(mockUser, dto);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.displayName).toBe('Nuevo nombre');
      expect(usersServiceMock.update).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('search', () => {
    it('should return an array of UserResponseDto', async () => {
      usersServiceMock.search.mockResolvedValue([mockUser]);
      const result = await controller.search({ query: 'test' });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
    });
  });

  describe('findById', () => {
    it('should return a UserResponseDto for a valid id', async () => {
      usersServiceMock.findByIdOrThrow.mockResolvedValue(mockUser);
      const result = await controller.findById('uuid-1');
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe('uuid-1');
    });

    it('should propagate NotFoundException from service', async () => {
      usersServiceMock.findByIdOrThrow.mockRejectedValue(new NotFoundException());
      await expect(controller.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
