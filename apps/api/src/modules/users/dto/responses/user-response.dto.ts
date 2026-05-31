import type { User } from '@prisma/client';
import { UserStatus } from '@prisma/client';

export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.displayName = user.displayName;
    this.avatarUrl = user.avatarUrl;
    this.status = user.status;
    this.createdAt = user.createdAt;
  }
}
