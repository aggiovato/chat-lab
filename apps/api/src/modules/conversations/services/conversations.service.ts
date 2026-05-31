import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationType, MemberRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateDirectConversationDto } from '../dto/requests/create-direct-conversation.dto';
import { CreateGroupConversationDto } from '../dto/requests/create-group-conversation.dto';
import { UpdateConversationDto } from '../dto/requests/update-conversation.dto';

const membersInclude = { members: { include: { user: true } } } satisfies Prisma.ConversationInclude;

export type ConversationWithMembers = Prisma.ConversationGetPayload<{
  include: typeof membersInclude;
}>;

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<ConversationWithMembers[]> {
    return this.prisma.conversation.findMany({
      where: { members: { some: { userId } } },
      include: membersInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<ConversationWithMembers | null> {
    return this.prisma.conversation.findUnique({ where: { id }, include: membersInclude });
  }

  async findByIdOrThrow(id: string): Promise<ConversationWithMembers> {
    const conversation = await this.findById(id);
    if (!conversation) throw new NotFoundException(`Conversation ${id} not found`);
    return conversation;
  }

  async isMember(conversationId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    return !!member;
  }

  async assertMember(conversationId: string, userId: string): Promise<void> {
    const member = await this.isMember(conversationId, userId);
    if (!member) throw new ForbiddenException('You are not a member of this conversation');
  }

  async createDirect(userId: string, dto: CreateDirectConversationDto): Promise<ConversationWithMembers> {
    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: dto.targetUserId } } },
        ],
      },
    });
    if (existing) throw new ConflictException('A direct conversation with this user already exists');

    return this.prisma.conversation.create({
      data: {
        type: ConversationType.DIRECT,
        members: {
          create: [
            { userId, role: MemberRole.MEMBER },
            { userId: dto.targetUserId, role: MemberRole.MEMBER },
          ],
        },
      },
      include: membersInclude,
    });
  }

  async createGroup(userId: string, dto: CreateGroupConversationDto): Promise<ConversationWithMembers> {
    const memberIds = [...new Set([userId, ...dto.memberIds])];

    return this.prisma.conversation.create({
      data: {
        type: ConversationType.GROUP,
        title: dto.title,
        members: {
          create: memberIds.map((id) => ({
            userId: id,
            role: id === userId ? MemberRole.OWNER : MemberRole.MEMBER,
          })),
        },
      },
      include: membersInclude,
    });
  }

  async update(id: string, userId: string, dto: UpdateConversationDto): Promise<ConversationWithMembers> {
    await this.assertMember(id, userId);
    return this.prisma.conversation.update({ where: { id }, data: dto, include: membersInclude });
  }
}
