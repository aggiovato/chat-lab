import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class RealtimeService {
  private server: Server;

  setServer(server: Server): void {
    this.server = server;
  }

  emitToRoom(room: string, event: string, payload: unknown): void {
    this.server?.to(room).emit(event, payload);
  }

  emitToSocket(socketId: string, event: string, payload: unknown): void {
    this.server?.to(socketId).emit(event, payload);
  }

  getRoomName(conversationId: string): string {
    return `conversation:${conversationId}`;
  }
}
