import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { User } from '@prisma/client';
import { RealtimeService } from '../services/realtime.service';
import { SocketAuthService } from '../services/socket-auth.service';
import { PresenceService } from '../services/presence.service';
import { ConversationsService } from '../../conversations/services/conversations.service';
import { MessagesService } from '../../messages/services/messages.service';
import { MessageResponseDto } from '../../messages/dto/responses/message-response.dto';
import { JoinConversationDto } from '../dto/join-conversation.dto';
import { LeaveConversationDto } from '../dto/leave-conversation.dto';
import { SendSocketMessageDto } from '../dto/send-socket-message.dto';
import { TypingDto } from '../dto/typing.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly socketAuthService: SocketAuthService,
    private readonly presenceService: PresenceService,
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  afterInit(server: Server): void {
    this.realtimeService.setServer(server);
  }

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const user = await this.socketAuthService.authenticate(socket);
      socket.data.user = user;
      this.presenceService.userConnected(user.id, socket.id);
      this.server.emit('presence:update', { userId: user.id, status: 'ONLINE' });
    } catch {
      // Reject unauthenticated connections immediately
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket): void {
    const user: User | undefined = socket.data.user;
    if (!user) return;

    this.presenceService.userDisconnected(user.id, socket.id);

    if (!this.presenceService.isOnline(user.id)) {
      this.server.emit('presence:update', { userId: user.id, status: 'OFFLINE' });
    }
  }

  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: JoinConversationDto,
  ): Promise<void> {
    const user: User = socket.data.user;
    await this.conversationsService.assertMember(dto.conversationId, user.id);
    await socket.join(this.realtimeService.getRoomName(dto.conversationId));
    socket.emit('chat:joined', { conversationId: dto.conversationId });
  }

  @SubscribeMessage('chat:leave')
  async handleLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: LeaveConversationDto,
  ): Promise<void> {
    await socket.leave(this.realtimeService.getRoomName(dto.conversationId));
    socket.emit('chat:left', { conversationId: dto.conversationId });
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: SendSocketMessageDto,
  ): Promise<void> {
    const user: User = socket.data.user;
    const message = await this.messagesService.send(user.id, dto.conversationId, {
      content: dto.content,
      type: dto.type,
      replyToId: dto.replyToId,
    });
    this.realtimeService.emitToRoom(
      this.realtimeService.getRoomName(dto.conversationId),
      'message:new',
      new MessageResponseDto(message),
    );
  }

  @SubscribeMessage('message:edit')
  async handleEditMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { messageId: string; content: string },
  ): Promise<void> {
    const user: User = socket.data.user;
    const message = await this.messagesService.update(user.id, data.messageId, { content: data.content });
    this.realtimeService.emitToRoom(
      this.realtimeService.getRoomName(message.conversationId),
      'message:updated',
      new MessageResponseDto(message),
    );
  }

  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { messageId: string },
  ): Promise<void> {
    const user: User = socket.data.user;
    const message = await this.messagesService.findByIdOrThrow(data.messageId);
    await this.messagesService.softDelete(user.id, data.messageId);
    this.realtimeService.emitToRoom(
      this.realtimeService.getRoomName(message.conversationId),
      'message:deleted',
      { messageId: data.messageId, conversationId: message.conversationId },
    );
  }

  @SubscribeMessage('message:read')
  async handleReadMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { messageId: string; conversationId: string },
  ): Promise<void> {
    const user: User = socket.data.user;
    this.realtimeService.emitToRoom(
      this.realtimeService.getRoomName(data.conversationId),
      'message:read',
      { messageId: data.messageId, userId: user.id },
    );
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: TypingDto,
  ): void {
    const user: User = socket.data.user;
    socket.to(this.realtimeService.getRoomName(dto.conversationId)).emit('typing:update', {
      conversationId: dto.conversationId,
      userId: user.id,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: TypingDto,
  ): void {
    const user: User = socket.data.user;
    socket.to(this.realtimeService.getRoomName(dto.conversationId)).emit('typing:update', {
      conversationId: dto.conversationId,
      userId: user.id,
      isTyping: false,
    });
  }
}
