import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { MessageReactionsService } from './message-reactions.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

const mockUser = {
  id: 'user-1', email: 'a@example.com', username: 'u', displayName: null,
  passwordHash: 'h', avatarUrl: null, status: UserStatus.OFFLINE, createdAt: new Date(), updatedAt: new Date(),
};

const mockReaction = { id: 'r-1', messageId: 'msg-1', userId: 'user-1', emoji: '👍', createdAt: new Date(), user: mockUser };

const prismaMock = {
  messageReaction: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('MessageReactionsService', () => {
  let service: MessageReactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageReactionsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MessageReactionsService>(MessageReactionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('add', () => {
    it('should upsert and return the reaction', async () => {
      prismaMock.messageReaction.upsert.mockResolvedValue(mockReaction);
      const result = await service.add('user-1', 'msg-1', '👍');
      expect(result.emoji).toBe('👍');
      expect(prismaMock.messageReaction.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should delete the reaction', async () => {
      prismaMock.messageReaction.deleteMany.mockResolvedValue({ count: 1 });
      await service.remove('user-1', 'msg-1', '👍');
      expect(prismaMock.messageReaction.deleteMany).toHaveBeenCalledWith({
        where: { messageId: 'msg-1', userId: 'user-1', emoji: '👍' },
      });
    });
  });

  describe('findByMessage', () => {
    it('should return all reactions for a message', async () => {
      prismaMock.messageReaction.findMany.mockResolvedValue([mockReaction]);
      const result = await service.findByMessage('msg-1');
      expect(result).toHaveLength(1);
    });
  });
});
