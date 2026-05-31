import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ConversationsController } from './controllers/conversations.controller';
import { ConversationMembersController } from './controllers/conversation-members.controller';
import { ConversationsService } from './services/conversations.service';
import { ConversationMembersService } from './services/conversation-members.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ConversationsController, ConversationMembersController],
  providers: [ConversationsService, ConversationMembersService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
