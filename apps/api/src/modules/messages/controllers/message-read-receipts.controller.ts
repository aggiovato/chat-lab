import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { MessageReadReceiptsService } from '../services/message-read-receipts.service';
import { MessageReadReceiptResponseDto } from '../dto/responses/message-read-receipt-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('messages/:messageId/read')
export class MessageReadReceiptsController {
  constructor(private readonly readReceiptsService: MessageReadReceiptsService) {}

  @Post()
  async markRead(
    @CurrentUser() user: User,
    @Param('messageId') messageId: string,
  ): Promise<MessageReadReceiptResponseDto> {
    const receipt = await this.readReceiptsService.markRead(user.id, messageId);
    return new MessageReadReceiptResponseDto(receipt);
  }
}
