import { Test, TestingModule } from '@nestjs/testing';
import { PresenceService } from './presence.service';

describe('PresenceService', () => {
  let service: PresenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PresenceService],
    }).compile();

    service = module.get<PresenceService>(PresenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userConnected / isOnline', () => {
    it('should mark user as online when a socket connects', () => {
      service.userConnected('user-1', 'socket-1');
      expect(service.isOnline('user-1')).toBe(true);
    });

    it('should remain online if a second socket connects', () => {
      service.userConnected('user-1', 'socket-1');
      service.userConnected('user-1', 'socket-2');
      service.userDisconnected('user-1', 'socket-1');
      expect(service.isOnline('user-1')).toBe(true);
    });
  });

  describe('userDisconnected', () => {
    it('should mark user as offline when all sockets disconnect', () => {
      service.userConnected('user-1', 'socket-1');
      service.userDisconnected('user-1', 'socket-1');
      expect(service.isOnline('user-1')).toBe(false);
    });
  });

  describe('getOnlineUsers', () => {
    it('should return only online users from a list', () => {
      service.userConnected('user-1', 'socket-1');
      const result = service.getOnlineUsers(['user-1', 'user-2', 'user-3']);
      expect(result).toEqual(['user-1']);
    });
  });
});
