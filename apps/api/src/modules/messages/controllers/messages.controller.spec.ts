import { Test, TestingModule } from '@nestjs/testing';
import { MessageType, UserStatus } from '@prisma/client';
import { MessagesController } from './messages.controller';
import { MessagesService } from '../services/messages.service';
import { MessageResponseDto } from '../dto/responses/message-response.dto';

const mockUser = {
  id: 'user-1', email: 'a@example.com', username: 'u', displayName: null,
  passwordHash: 'h', avatarUrl: null, status: UserStatus.OFFLINE, createdAt: new Date(), updatedAt: new Date(),
};

const mockMessage = {
  id: 'msg-1', conversationId: 'conv-1', senderId: 'user-1',
  type: MessageType.TEXT, content: 'Hello', commandName: null,
  metadata: null, replyToId: null, editedAt: null, deletedAt: null,
  createdAt: new Date(), updatedAt: new Date(),
  sender: mockUser, reactions: [], readReceipts: [], attachments: [],
};

const messagesServiceMock = {
  findAll: jest.fn(),
  send: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('MessagesController', () => {
  let controller: MessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [{ provide: MessagesService, useValue: messagesServiceMock }],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of MessageResponseDto', async () => {
      messagesServiceMock.findAll.mockResolvedValue([mockMessage]);
      const result = await controller.findAll(mockUser, 'conv-1', {});
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MessageResponseDto);
    });
  });

  describe('send', () => {
    it('should return MessageResponseDto', async () => {
      messagesServiceMock.send.mockResolvedValue(mockMessage);
      const result = await controller.send(mockUser, 'conv-1', { content: 'Hello' });
      expect(result).toBeInstanceOf(MessageResponseDto);
    });
  });

  describe('update', () => {
    it('should return updated MessageResponseDto', async () => {
      messagesServiceMock.update.mockResolvedValue({ ...mockMessage, content: 'Updated' });
      const result = await controller.update(mockUser, 'msg-1', { content: 'Updated' });
      expect(result).toBeInstanceOf(MessageResponseDto);
      expect(result.content).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should call softDelete', async () => {
      messagesServiceMock.softDelete.mockResolvedValue(undefined);
      await controller.remove(mockUser, 'msg-1');
      expect(messagesServiceMock.softDelete).toHaveBeenCalledWith('user-1', 'msg-1');
    });
  });
});
