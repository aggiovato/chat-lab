import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  // userId → set of active socketIds (one user can have multiple tabs open)
  private readonly online = new Map<string, Set<string>>();

  userConnected(userId: string, socketId: string): void {
    if (!this.online.has(userId)) {
      this.online.set(userId, new Set());
    }
    this.online.get(userId)!.add(socketId);
  }

  userDisconnected(userId: string, socketId: string): void {
    this.online.get(userId)?.delete(socketId);
    if (this.online.get(userId)?.size === 0) {
      this.online.delete(userId);
    }
  }

  isOnline(userId: string): boolean {
    return (this.online.get(userId)?.size ?? 0) > 0;
  }

  getOnlineUsers(userIds: string[]): string[] {
    return userIds.filter((id) => this.isOnline(id));
  }
}
