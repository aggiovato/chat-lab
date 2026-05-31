import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { MessageReadReceiptsController } from './message-read-receipts.controller';
import { MessageReadReceiptsService } from '../services/message-read-receipts.service';
import { MessageReadReceiptResponseDto } from '../dto/responses/message-read-receipt-response.dto';

const mockUser = {
  id: 'user-1', email: 'a@example.com', username: 'u', displayName: null,
  passwordHash: 'h', avatarUrl: null, status: UserStatus.OFFLINE, createdAt: new Date(), updatedAt: new Date(),
};

const mockReceipt = { id: 'rec-1', messageId: 'msg-1', userId: 'user-1', readAt: new Date(), user: mockUser };

const readReceiptsServiceMock = { markRead: jest.fn() };

describe('MessageReadReceiptsController', () => {
  let controller: MessageReadReceiptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageReadReceiptsController],
      providers: [{ provide: MessageReadReceiptsService, useValue: readReceiptsServiceMock }],
    }).compile();

    controller = module.get<MessageReadReceiptsController>(MessageReadReceiptsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('markRead', () => {
    it('should return MessageReadReceiptResponseDto', async () => {
      readReceiptsServiceMock.markRead.mockResolvedValue(mockReceipt);
      const result = await controller.markRead(mockUser, 'msg-1');
      expect(result).toBeInstanceOf(MessageReadReceiptResponseDto);
      expect(result.userId).toBe('user-1');
    });
  });
});
