import { Test, TestingModule } from '@nestjs/testing';
import { ConversationType, MemberRole, UserStatus } from '@prisma/client';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from '../services/conversations.service';
import { ConversationResponseDto } from '../dto/responses/conversation-response.dto';

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

const mockConversation = {
  id: 'conv-1',
  type: ConversationType.DIRECT,
  title: null,
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  members: [{ id: 'mem-1', conversationId: 'conv-1', userId: 'user-1', role: MemberRole.MEMBER, joinedAt: new Date(), muted: false, archived: false, user: mockUser }],
};

const conversationsServiceMock = {
  findAllByUser: jest.fn(),
  createDirect: jest.fn(),
  createGroup: jest.fn(),
  findByIdOrThrow: jest.fn(),
  assertMember: jest.fn(),
  update: jest.fn(),
};

describe('ConversationsController', () => {
  let controller: ConversationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [{ provide: ConversationsService, useValue: conversationsServiceMock }],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of ConversationResponseDto', async () => {
      conversationsServiceMock.findAllByUser.mockResolvedValue([mockConversation]);
      const result = await controller.findAll(mockUser);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ConversationResponseDto);
    });
  });

  describe('createDirect', () => {
    it('should return a ConversationResponseDto', async () => {
      conversationsServiceMock.createDirect.mockResolvedValue(mockConversation);
      const result = await controller.createDirect(mockUser, { targetUserId: 'user-2' });
      expect(result).toBeInstanceOf(ConversationResponseDto);
    });
  });

  describe('createGroup', () => {
    it('should return a ConversationResponseDto', async () => {
      conversationsServiceMock.createGroup.mockResolvedValue({ ...mockConversation, type: ConversationType.GROUP });
      const result = await controller.createGroup(mockUser, { memberIds: ['user-2'] });
      expect(result).toBeInstanceOf(ConversationResponseDto);
      expect(result.type).toBe(ConversationType.GROUP);
    });
  });

  describe('findOne', () => {
    it('should validate membership and return ConversationResponseDto', async () => {
      conversationsServiceMock.assertMember.mockResolvedValue(undefined);
      conversationsServiceMock.findByIdOrThrow.mockResolvedValue(mockConversation);
      const result = await controller.findOne(mockUser, 'conv-1');
      expect(conversationsServiceMock.assertMember).toHaveBeenCalledWith('conv-1', 'user-1');
      expect(result).toBeInstanceOf(ConversationResponseDto);
    });
  });

  describe('update', () => {
    it('should return updated ConversationResponseDto', async () => {
      conversationsServiceMock.update.mockResolvedValue({ ...mockConversation, title: 'Nuevo título' });
      const result = await controller.update(mockUser, 'conv-1', { title: 'Nuevo título' });
      expect(result).toBeInstanceOf(ConversationResponseDto);
      expect(result.title).toBe('Nuevo título');
    });
  });
});
