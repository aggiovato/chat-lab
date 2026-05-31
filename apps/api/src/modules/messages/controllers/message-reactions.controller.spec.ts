import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import { MessageReactionsController } from './message-reactions.controller';
import { MessageReactionsService } from '../services/message-reactions.service';
import { MessageReactionResponseDto } from '../dto/responses/message-reaction-response.dto';

const mockUser = {
  id: 'user-1', email: 'a@example.com', username: 'u', displayName: null,
  passwordHash: 'h', avatarUrl: null, status: UserStatus.OFFLINE, createdAt: new Date(), updatedAt: new Date(),
};

const mockReaction = { id: 'r-1', messageId: 'msg-1', userId: 'user-1', emoji: '👍', createdAt: new Date(), user: mockUser };

const reactionsServiceMock = { add: jest.fn(), remove: jest.fn() };

describe('MessageReactionsController', () => {
  let controller: MessageReactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageReactionsController],
      providers: [{ provide: MessageReactionsService, useValue: reactionsServiceMock }],
    }).compile();

    controller = module.get<MessageReactionsController>(MessageReactionsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('add', () => {
    it('should return MessageReactionResponseDto', async () => {
      reactionsServiceMock.add.mockResolvedValue(mockReaction);
      const result = await controller.add(mockUser, 'msg-1', { emoji: '👍' });
      expect(result).toBeInstanceOf(MessageReactionResponseDto);
      expect(result.emoji).toBe('👍');
    });
  });

  describe('remove', () => {
    it('should call remove on service', async () => {
      reactionsServiceMock.remove.mockResolvedValue(undefined);
      await controller.remove(mockUser, 'msg-1', '👍');
      expect(reactionsServiceMock.remove).toHaveBeenCalledWith('user-1', 'msg-1', '👍');
    });
  });
});
