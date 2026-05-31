import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { MessageReactionsService } from '../services/message-reactions.service';
import { AddMessageReactionDto } from '../dto/requests/add-message-reaction.dto';
import { MessageReactionResponseDto } from '../dto/responses/message-reaction-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('messages/:messageId/reactions')
export class MessageReactionsController {
  constructor(private readonly reactionsService: MessageReactionsService) {}

  @Post()
  async add(
    @CurrentUser() user: User,
    @Param('messageId') messageId: string,
    @Body() dto: AddMessageReactionDto,
  ): Promise<MessageReactionResponseDto> {
    const reaction = await this.reactionsService.add(user.id, messageId, dto.emoji);
    return new MessageReactionResponseDto(reaction);
  }

  @Delete(':emoji')
  async remove(
    @CurrentUser() user: User,
    @Param('messageId') messageId: string,
    @Param('emoji') emoji: string,
  ): Promise<void> {
    await this.reactionsService.remove(user.id, messageId, emoji);
  }
}
