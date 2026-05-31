import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { UpdateUserDto } from '../dto/requests/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async search(query: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findByIdOrThrow(id);
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: UserStatus): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { status } });
  }
}
