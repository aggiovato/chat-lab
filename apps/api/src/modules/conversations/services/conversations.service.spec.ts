import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConversationType, MemberRole, UserStatus } from '@prisma/client';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

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

const prismaMock = {
  conversation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  conversationMember: {
    findUnique: jest.fn(),
  },
};

describe('ConversationsService', () => {
  let service: ConversationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUser', () => {
    it('should return conversations for a user', async () => {
      prismaMock.conversation.findMany.mockResolvedValue([mockConversation]);
      const result = await service.findAllByUser('user-1');
      expect(result).toHaveLength(1);
      expect(prismaMock.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { members: { some: { userId: 'user-1' } } } }),
      );
    });
  });

  describe('findByIdOrThrow', () => {
    it('should return the conversation when found', async () => {
      prismaMock.conversation.findUnique.mockResolvedValue(mockConversation);
      const result = await service.findByIdOrThrow('conv-1');
      expect(result.id).toBe('conv-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prismaMock.conversation.findUnique.mockResolvedValue(null);
      await expect(service.findByIdOrThrow('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('isMember', () => {
    it('should return true when user is a member', async () => {
      prismaMock.conversationMember.findUnique.mockResolvedValue({ id: 'mem-1' });
      expect(await service.isMember('conv-1', 'user-1')).toBe(true);
    });

    it('should return false when user is not a member', async () => {
      prismaMock.conversationMember.findUnique.mockResolvedValue(null);
      expect(await service.isMember('conv-1', 'user-2')).toBe(false);
    });
  });

  describe('assertMember', () => {
    it('should throw ForbiddenException when not a member', async () => {
      prismaMock.conversationMember.findUnique.mockResolvedValue(null);
      await expect(service.assertMember('conv-1', 'user-2')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createDirect', () => {
    it('should create a direct conversation', async () => {
      prismaMock.conversation.findFirst.mockResolvedValue(null);
      prismaMock.conversation.create.mockResolvedValue(mockConversation);
      const result = await service.createDirect('user-1', { targetUserId: 'user-2' });
      expect(result.type).toBe(ConversationType.DIRECT);
    });

    it('should throw ConflictException if conversation already exists', async () => {
      prismaMock.conversation.findFirst.mockResolvedValue(mockConversation);
      await expect(service.createDirect('user-1', { targetUserId: 'user-2' })).rejects.toThrow(ConflictException);
    });
  });

  describe('createGroup', () => {
    it('should create a group conversation with creator as OWNER', async () => {
      prismaMock.conversation.create.mockResolvedValue({ ...mockConversation, type: ConversationType.GROUP });
      const result = await service.createGroup('user-1', { memberIds: ['user-2'], title: 'Mi grupo' });
      expect(result.type).toBe(ConversationType.GROUP);
      expect(prismaMock.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: ConversationType.GROUP,
            members: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ userId: 'user-1', role: MemberRole.OWNER }),
              ]),
            }),
          }),
        }),
      );
    });
  });
});
