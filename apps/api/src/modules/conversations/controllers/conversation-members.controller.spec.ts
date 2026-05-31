import { Test, TestingModule } from '@nestjs/testing';
import { MemberRole, UserStatus } from '@prisma/client';
import { ConversationMembersController } from './conversation-members.controller';
import { ConversationsService } from '../services/conversations.service';
import { ConversationMembersService } from '../services/conversation-members.service';
import { ConversationMemberResponseDto } from '../dto/responses/conversation-member-response.dto';

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

const conversationsServiceMock = { assertMember: jest.fn() };
const membersServiceMock = {
  findAll: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
};

describe('ConversationMembersController', () => {
  let controller: ConversationMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationMembersController],
      providers: [
        { provide: ConversationsService, useValue: conversationsServiceMock },
        { provide: ConversationMembersService, useValue: membersServiceMock },
      ],
    }).compile();

    controller = module.get<ConversationMembersController>(ConversationMembersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should validate membership and return members', async () => {
      conversationsServiceMock.assertMember.mockResolvedValue(undefined);
      membersServiceMock.findAll.mockResolvedValue([mockMember]);
      const result = await controller.findAll(mockUser, 'conv-1');
      expect(conversationsServiceMock.assertMember).toHaveBeenCalledWith('conv-1', 'user-1');
      expect(result[0]).toBeInstanceOf(ConversationMemberResponseDto);
    });
  });

  describe('addMember', () => {
    it('should validate membership and add a new member', async () => {
      conversationsServiceMock.assertMember.mockResolvedValue(undefined);
      membersServiceMock.addMember.mockResolvedValue(mockMember);
      const result = await controller.addMember(mockUser, 'conv-1', { userId: 'user-2' });
      expect(result).toBeInstanceOf(ConversationMemberResponseDto);
    });
  });

  describe('removeMember', () => {
    it('should validate membership and remove a member', async () => {
      conversationsServiceMock.assertMember.mockResolvedValue(undefined);
      membersServiceMock.removeMember.mockResolvedValue(undefined);
      await controller.removeMember(mockUser, 'conv-1', 'user-2');
      expect(membersServiceMock.removeMember).toHaveBeenCalledWith('conv-1', 'user-2');
    });
  });
});
