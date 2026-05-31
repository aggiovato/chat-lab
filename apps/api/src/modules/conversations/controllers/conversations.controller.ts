import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ConversationsService } from '../services/conversations.service';
import { CreateDirectConversationDto } from '../dto/requests/create-direct-conversation.dto';
import { CreateGroupConversationDto } from '../dto/requests/create-group-conversation.dto';
import { UpdateConversationDto } from '../dto/requests/update-conversation.dto';
import { ConversationResponseDto } from '../dto/responses/conversation-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async findAll(@CurrentUser() user: User): Promise<ConversationResponseDto[]> {
    const conversations = await this.conversationsService.findAllByUser(user.id);
    return conversations.map((c) => new ConversationResponseDto(c));
  }

  @Post('direct')
  async createDirect(
    @CurrentUser() user: User,
    @Body() dto: CreateDirectConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationsService.createDirect(user.id, dto);
    return new ConversationResponseDto(conversation);
  }

  @Post('group')
  async createGroup(
    @CurrentUser() user: User,
    @Body() dto: CreateGroupConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationsService.createGroup(user.id, dto);
    return new ConversationResponseDto(conversation);
  }

  @Get(':conversationId')
  async findOne(
    @CurrentUser() user: User,
    @Param('conversationId') conversationId: string,
  ): Promise<ConversationResponseDto> {
    await this.conversationsService.assertMember(conversationId, user.id);
    const conversation = await this.conversationsService.findByIdOrThrow(conversationId);
    return new ConversationResponseDto(conversation);
  }

  @Patch(':conversationId')
  async update(
    @CurrentUser() user: User,
    @Param('conversationId') conversationId: string,
    @Body() dto: UpdateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationsService.update(conversationId, user.id, dto);
    return new ConversationResponseDto(conversation);
  }
}
