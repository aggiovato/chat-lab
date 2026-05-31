import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { MessagesService } from '../services/messages.service';
import { SendMessageDto } from '../dto/requests/send-message.dto';
import { UpdateMessageDto } from '../dto/requests/update-message.dto';
import { MessageListQueryDto } from '../dto/requests/message-list-query.dto';
import { MessageResponseDto } from '../dto/responses/message-response.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations/:conversationId/messages')
  async findAll(
    @CurrentUser() user: User,
    @Param('conversationId') conversationId: string,
    @Query() query: MessageListQueryDto,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.messagesService.findAll(conversationId, user.id, query);
    return messages.map((m) => new MessageResponseDto(m));
  }

  @Post('conversations/:conversationId/messages')
  async send(
    @CurrentUser() user: User,
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.send(user.id, conversationId, dto);
    return new MessageResponseDto(message);
  }

  @Patch('messages/:messageId')
  async update(
    @CurrentUser() user: User,
    @Param('messageId') messageId: string,
    @Body() dto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.update(user.id, messageId, dto);
    return new MessageResponseDto(message);
  }

  @Delete('messages/:messageId')
  async remove(
    @CurrentUser() user: User,
    @Param('messageId') messageId: string,
  ): Promise<void> {
    await this.messagesService.softDelete(user.id, messageId);
  }
}
