import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { ChatGateway } from './gateways/chat.gateway';
import { RealtimeService } from './services/realtime.service';
import { SocketAuthService } from './services/socket-auth.service';
import { PresenceService } from './services/presence.service';

@Module({
  imports: [AuthModule, UsersModule, ConversationsModule, MessagesModule],
  providers: [ChatGateway, RealtimeService, SocketAuthService, PresenceService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
