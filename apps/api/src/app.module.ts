import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './core/health/health.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [PrismaModule, HealthModule, UsersModule, AuthModule, ConversationsModule, MessagesModule, RealtimeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
