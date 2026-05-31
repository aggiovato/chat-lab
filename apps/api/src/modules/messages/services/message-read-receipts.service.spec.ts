import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { MessageReadReceiptsService } from './message-read-receipts.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

const mockUser = {
  id: 'user-1', email: 'a@example.com', username: 'u', displayName: null,
  passwordHash: 'h', avatarUrl: null, status: UserStatus.OFFLINE, createdAt: new Date(), updatedAt: new Date(),
};

const mockReceipt = { id: 'rec-1', messageId: 'msg-1', userId: 'user-1', readAt: new Date(), user: mockUser };

const prismaMock = {
  messageReadReceipt: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('MessageReadReceiptsService', () => {
  let service: MessageReadReceiptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageReadReceiptsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MessageReadReceiptsService>(MessageReadReceiptsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markRead', () => {
    it('should upsert and return the receipt', async () => {
      prismaMock.messageReadReceipt.upsert.mockResolvedValue(mockReceipt);
      const result = await service.markRead('user-1', 'msg-1');
      expect(result.userId).toBe('user-1');
      expect(prismaMock.messageReadReceipt.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasRead', () => {
    it('should return true if receipt exists', async () => {
      prismaMock.messageReadReceipt.findUnique.mockResolvedValue(mockReceipt);
      expect(await service.hasRead('user-1', 'msg-1')).toBe(true);
    });

    it('should return false if receipt does not exist', async () => {
      prismaMock.messageReadReceipt.findUnique.mockResolvedValue(null);
      expect(await service.hasRead('user-1', 'msg-1')).toBe(false);
    });
  });
});
