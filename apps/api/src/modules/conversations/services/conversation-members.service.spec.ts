import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MemberRole, UserStatus } from '@prisma/client';
import { ConversationMembersService } from './conversation-members.service';
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

const mockMember = {
  id: 'mem-1',
  conversationId: 'conv-1',
  userId: 'user-1',
  role: MemberRole.MEMBER,
  joinedAt: new Date(),
  muted: false,
  archived: false,
  user: mockUser,
};

const prismaMock = {
  conversationMember: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ConversationMembersService', () => {
  let service: ConversationMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationMembersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ConversationMembersService>(ConversationMembersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all members of a conversation', async () => {
      prismaMock.conversationMember.findMany.mockResolvedValue([mockMember]);
      const result = await service.findAll('conv-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('addMember', () => {
    it('should add a member with default MEMBER role', async () => {
      prismaMock.conversationMember.create.mockResolvedValue(mockMember);
      await service.addMember('conv-1', 'user-1');
      expect(prismaMock.conversationMember.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: MemberRole.MEMBER }) }),
      );
    });
  });

  describe('removeMember', () => {
    it('should remove an existing member', async () => {
      prismaMock.conversationMember.findUnique.mockResolvedValue(mockMember);
      prismaMock.conversationMember.delete.mockResolvedValue(mockMember);
      await service.removeMember('conv-1', 'user-1');
      expect(prismaMock.conversationMember.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if member does not exist', async () => {
      prismaMock.conversationMember.findUnique.mockResolvedValue(null);
      await expect(service.removeMember('conv-1', 'unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRole', () => {
    it('should update member role', async () => {
      prismaMock.conversationMember.update.mockResolvedValue({ ...mockMember, role: MemberRole.ADMIN });
      const result = await service.updateRole('conv-1', 'user-1', MemberRole.ADMIN);
      expect(result.role).toBe(MemberRole.ADMIN);
    });
  });
});
