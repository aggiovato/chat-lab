import { Test, TestingModule } from '@nestjs/testing';
import { MessageType, UserStatus } from '@prisma/client';
import { ChatGateway } from './chat.gateway';
import { RealtimeService } from '../services/realtime.service';
import { SocketAuthService } from '../services/socket-auth.service';
import { PresenceService } from '../services/presence.service';
import { ConversationsService } from '../../conversations/services/conversations.service';
import { MessagesService } from '../../messages/services/messages.service';

const mockUser = {
  id: 'user-1', email: 'a@example.com', username: 'u', displayName: null,
  passwordHash: 'h', avatarUrl: null, status: UserStatus.OFFLINE,
  createdAt: new Date(), updatedAt: new Date(),
};

const mockMessage = {
  id: 'msg-1', conversationId: 'conv-1', senderId: 'user-1',
  type: MessageType.TEXT, content: 'Hello', commandName: null,
  metadata: null, replyToId: null, editedAt: null, deletedAt: null,
  createdAt: new Date(), updatedAt: new Date(),
  sender: mockUser, reactions: [], readReceipts: [], attachments: [],
};

const mockSocket = {
  id: 'socket-1',
  data: { user: mockUser },
  disconnect: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
} as any;

const mockServer = { emit: jest.fn() } as any;

const realtimeServiceMock = {
  setServer: jest.fn(),
  getRoomName: jest.fn((id: string) => `conversation:${id}`),
  emitToRoom: jest.fn(),
};
const socketAuthServiceMock = { authenticate: jest.fn() };
const presenceServiceMock = {
  userConnected: jest.fn(),
  userDisconnected: jest.fn(),
  isOnline: jest.fn(),
};
const conversationsServiceMock = { assertMember: jest.fn() };
const messagesServiceMock = {
  send: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findByIdOrThrow: jest.fn(),
};

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: RealtimeService, useValue: realtimeServiceMock },
        { provide: SocketAuthService, useValue: socketAuthServiceMock },
        { provide: PresenceService, useValue: presenceServiceMock },
        { provide: ConversationsService, useValue: conversationsServiceMock },
        { provide: MessagesService, useValue: messagesServiceMock },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    (gateway as any).server = mockServer;
    jest.clearAllMocks();
    realtimeServiceMock.getRoomName.mockImplementation((id: string) => `conversation:${id}`);
    mockSocket.to.mockReturnThis();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should set the server on RealtimeService', () => {
      gateway.afterInit(mockServer);
      expect(realtimeServiceMock.setServer).toHaveBeenCalledWith(mockServer);
    });
  });

  describe('handleConnection', () => {
    it('should authenticate and register presence on connect', async () => {
      socketAuthServiceMock.authenticate.mockResolvedValue(mockUser);
      await gateway.handleConnection(mockSocket);
      expect(mockSocket.data.user).toEqual(mockUser);
      expect(presenceServiceMock.userConnected).toHaveBeenCalledWith('user-1', 'socket-1');
      expect(mockServer.emit).toHaveBeenCalledWith('presence:update', { userId: 'user-1', status: 'ONLINE' });
    });

    it('should disconnect socket if authentication fails', async () => {
      socketAuthServiceMock.authenticate.mockRejectedValue(new Error('Unauthorized'));
      await gateway.handleConnection(mockSocket);
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should emit OFFLINE when user has no more active sockets', () => {
      presenceServiceMock.isOnline.mockReturnValue(false);
      gateway.handleDisconnect(mockSocket);
      expect(presenceServiceMock.userDisconnected).toHaveBeenCalledWith('user-1', 'socket-1');
      expect(mockServer.emit).toHaveBeenCalledWith('presence:update', { userId: 'user-1', status: 'OFFLINE' });
    });

    it('should not emit OFFLINE if user still has other sockets open', () => {
      presenceServiceMock.isOnline.mockReturnValue(true);
      gateway.handleDisconnect(mockSocket);
      expect(mockServer.emit).not.toHaveBeenCalled();
    });
  });

  describe('handleJoin', () => {
    it('should validate membership and join the room', async () => {
      conversationsServiceMock.assertMember.mockResolvedValue(undefined);
      await gateway.handleJoin(mockSocket, { conversationId: 'conv-1' });
      expect(conversationsServiceMock.assertMember).toHaveBeenCalledWith('conv-1', 'user-1');
      expect(mockSocket.join).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('chat:joined', { conversationId: 'conv-1' });
    });
  });

  describe('handleLeave', () => {
    it('should leave the room', async () => {
      await gateway.handleLeave(mockSocket, { conversationId: 'conv-1' });
      expect(mockSocket.leave).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('chat:left', { conversationId: 'conv-1' });
    });
  });

  describe('handleSendMessage', () => {
    it('should send a message and emit to the room', async () => {
      messagesServiceMock.send.mockResolvedValue(mockMessage);
      await gateway.handleSendMessage(mockSocket, { conversationId: 'conv-1', content: 'Hello' });
      expect(messagesServiceMock.send).toHaveBeenCalledWith('user-1', 'conv-1', expect.objectContaining({ content: 'Hello' }));
      expect(realtimeServiceMock.emitToRoom).toHaveBeenCalledWith('conversation:conv-1', 'message:new', expect.any(Object));
    });
  });

  describe('handleTypingStart', () => {
    it('should broadcast typing:update with isTyping true to the room', () => {
      gateway.handleTypingStart(mockSocket, { conversationId: 'conv-1' });
      expect(mockSocket.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockSocket.emit).toHaveBeenCalledWith('typing:update', {
        conversationId: 'conv-1',
        userId: 'user-1',
        isTyping: true,
      });
    });
  });

  describe('handleTypingStop', () => {
    it('should broadcast typing:update with isTyping false to the room', () => {
      gateway.handleTypingStop(mockSocket, { conversationId: 'conv-1' });
      expect(mockSocket.emit).toHaveBeenCalledWith('typing:update', expect.objectContaining({ isTyping: false }));
    });
  });
});
