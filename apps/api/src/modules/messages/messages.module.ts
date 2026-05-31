import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesController } from './controllers/messages.controller';
import { MessageReactionsController } from './controllers/message-reactions.controller';
import { MessageReadReceiptsController } from './controllers/message-read-receipts.controller';
import { MessagesService } from './services/messages.service';
import { MessageReactionsService } from './services/message-reactions.service';
import { MessageReadReceiptsService } from './services/message-read-receipts.service';

@Module({
  imports: [AuthModule, ConversationsModule],
  controllers: [MessagesController, MessageReactionsController, MessageReadReceiptsController],
  providers: [MessagesService, MessageReactionsService, MessageReadReceiptsService],
  exports: [MessagesService],
})
export class MessagesModule {}
