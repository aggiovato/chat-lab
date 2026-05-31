import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

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

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findById('uuid-1');
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });

    it('should return null when not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const result = await service.findById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('findByIdOrThrow', () => {
    it('should return the user when found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findByIdOrThrow('uuid-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.findByIdOrThrow('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should query by email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      await service.findByEmail('test@example.com');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });
  });

  describe('findByUsername', () => {
    it('should query by username', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      await service.findByUsername('testuser');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    });
  });

  describe('search', () => {
    it('should return matching users', async () => {
      prismaMock.user.findMany.mockResolvedValue([mockUser]);
      const result = await service.search('test');
      expect(result).toHaveLength(1);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Object), take: 20 }),
      );
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      prismaMock.user.create.mockResolvedValue(mockUser);
      const data = { email: 'new@example.com', username: 'new', passwordHash: 'hash' };
      const result = await service.create(data);
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue({ ...mockUser, displayName: 'Nuevo nombre' });
      const result = await service.update('uuid-1', { displayName: 'Nuevo nombre' });
      expect(result.displayName).toBe('Nuevo nombre');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.update('unknown', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update the user status', async () => {
      prismaMock.user.update.mockResolvedValue({ ...mockUser, status: UserStatus.ONLINE });
      await service.updateStatus('uuid-1', UserStatus.ONLINE);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { status: UserStatus.ONLINE },
      });
    });
  });
});
