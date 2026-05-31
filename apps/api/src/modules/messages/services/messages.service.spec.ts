import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageType, UserStatus } from '@prisma/client';
import { MessagesService } from './messages.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ConversationsService } from '../../conversations/services/conversations.service';

const mockUser = {
  id: 'user-1',
  email: 'a@example.com',
  username: 'userone',
  displayName: null,
  passwordHash: 'hash',
  avatarUrl: null,
  status: UserStatus.OFFLINE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMessage = {
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'user-1',
  type: MessageType.TEXT,
  content: 'Hello',
  commandName: null,
  metadata: null,
  replyToId: null,
  editedAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  sender: mockUser,
  reactions: [],
  readReceipts: [],
  attachments: [],
};

const prismaMock = {
  message: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const conversationsServiceMock = {
  assertMember: jest.fn(),
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConversationsService, useValue: conversationsServiceMock },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should assert membership and return messages', async () => {
      conversationsServiceMock.assertMember.mockResolvedValue(undefined);
      prismaMock.message.findMany.mockResolvedValue([mockMessage]);
      const result = await service.findAll('conv-1', 'user-1', { limit: 50 });
      expect(conversationsServiceMock.assertMember).toHaveBeenCalledWith('conv-1', 'user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByIdOrThrow', () => {
    it('should return a message when found', async () => {
      prismaMock.message.findUnique.mockResolvedValue(mockMessage);
      const result = await service.findByIdOrThrow('msg-1');
      expect(result.id).toBe('msg-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prismaMock.message.findUnique.mockResolvedValue(null);
      await expect(service.findByIdOrThrow('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('send', () => {
    it('should assert membership and create a TEXT message', async () => {
      conversationsServiceMock.assertMember.mockResolvedValue(undefined);
      prismaMock.message.create.mockResolvedValue(mockMessage);
      const result = await service.send('user-1', 'conv-1', { content: 'Hello' });
      expect(result.type).toBe(MessageType.TEXT);
      expect(conversationsServiceMock.assertMember).toHaveBeenCalledWith('conv-1', 'user-1');
    });

    it('should set type COMMAND when content starts with "/"', async () => {
      conversationsServiceMock.assertMember.mockResolvedValue(undefined);
      prismaMock.message.create.mockResolvedValue({ ...mockMessage, type: MessageType.COMMAND });
      const result = await service.send('user-1', 'conv-1', { content: '/joke' });
      expect(prismaMock.message.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ type: MessageType.COMMAND }) }),
      );
    });
  });

  describe('update', () => {
    it('should update content and set editedAt', async () => {
      prismaMock.message.findUnique.mockResolvedValue(mockMessage);
      prismaMock.message.update.mockResolvedValue({ ...mockMessage, content: 'Updated', editedAt: new Date() });
      const result = await service.update('user-1', 'msg-1', { content: 'Updated' });
      expect(result.content).toBe('Updated');
    });

    it('should throw ForbiddenException if user is not the sender', async () => {
      prismaMock.message.findUnique.mockResolvedValue(mockMessage);
      await expect(service.update('user-2', 'msg-1', { content: 'x' })).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if message is deleted', async () => {
      prismaMock.message.findUnique.mockResolvedValue({ ...mockMessage, deletedAt: new Date() });
      await expect(service.update('user-1', 'msg-1', { content: 'x' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt on the message', async () => {
      prismaMock.message.findUnique.mockResolvedValue(mockMessage);
      prismaMock.message.update.mockResolvedValue({ ...mockMessage, deletedAt: new Date() });
      await service.softDelete('user-1', 'msg-1');
      expect(prismaMock.message.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
      );
    });

    it('should throw ForbiddenException if user is not the sender', async () => {
      prismaMock.message.findUnique.mockResolvedValue(mockMessage);
      await expect(service.softDelete('user-2', 'msg-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
