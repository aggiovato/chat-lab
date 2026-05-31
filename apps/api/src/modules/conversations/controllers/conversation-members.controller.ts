import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ConversationsService } from '../services/conversations.service';
import { ConversationMembersService } from '../services/conversation-members.service';
import { AddConversationMemberDto } from '../dto/requests/add-conversation-member.dto';
import { ConversationMemberResponseDto } from '../dto/responses/conversation-member-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('conversations/:conversationId/members')
export class ConversationMembersController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly membersService: ConversationMembersService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Param('conversationId') conversationId: string,
  ): Promise<ConversationMemberResponseDto[]> {
    await this.conversationsService.assertMember(conversationId, user.id);
    const members = await this.membersService.findAll(conversationId);
    return members.map((m) => new ConversationMemberResponseDto(m));
  }

  @Post()
  async addMember(
    @CurrentUser() user: User,
    @Param('conversationId') conversationId: string,
    @Body() dto: AddConversationMemberDto,
  ): Promise<ConversationMemberResponseDto> {
    await this.conversationsService.assertMember(conversationId, user.id);
    const member = await this.membersService.addMember(conversationId, dto.userId, dto.role);
    return new ConversationMemberResponseDto(member);
  }

  @Delete(':userId')
  async removeMember(
    @CurrentUser() user: User,
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.conversationsService.assertMember(conversationId, user.id);
    await this.membersService.removeMember(conversationId, userId);
  }
}
