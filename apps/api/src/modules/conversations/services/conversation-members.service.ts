import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

const memberInclude = { user: true } satisfies Prisma.ConversationMemberInclude;

export type MemberWithUser = Prisma.ConversationMemberGetPayload<{
  include: typeof memberInclude;
}>;

@Injectable()
export class ConversationMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(conversationId: string): Promise<MemberWithUser[]> {
    return this.prisma.conversationMember.findMany({
      where: { conversationId },
      include: memberInclude,
    });
  }

  async addMember(conversationId: string, userId: string, role: MemberRole = MemberRole.MEMBER): Promise<MemberWithUser> {
    return this.prisma.conversationMember.create({
      data: { conversationId, userId, role },
      include: memberInclude,
    });
  }

  async removeMember(conversationId: string, userId: string): Promise<void> {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!member) throw new NotFoundException('User is not a member of this conversation');
    await this.prisma.conversationMember.delete({
      where: { conversationId_userId: { conversationId, userId } },
    });
  }

  async updateRole(conversationId: string, userId: string, role: MemberRole): Promise<MemberWithUser> {
    return this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { role },
      include: memberInclude,
    });
  }
}
