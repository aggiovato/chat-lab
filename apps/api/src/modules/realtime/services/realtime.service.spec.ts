import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeService } from './realtime.service';

const mockServer = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

describe('RealtimeService', () => {
  let service: RealtimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeService],
    }).compile();

    service = module.get<RealtimeService>(RealtimeService);
    service.setServer(mockServer as any);
    jest.clearAllMocks();
    mockServer.to.mockReturnThis();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRoomName', () => {
    it('should return conversation room name', () => {
      expect(service.getRoomName('conv-1')).toBe('conversation:conv-1');
    });
  });

  describe('emitToRoom', () => {
    it('should emit event to the correct room', () => {
      service.emitToRoom('conversation:conv-1', 'message:new', { id: 'msg-1' });
      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockServer.emit).toHaveBeenCalledWith('message:new', { id: 'msg-1' });
    });
  });

  describe('emitToSocket', () => {
    it('should emit event to a specific socket', () => {
      service.emitToSocket('socket-id-1', 'error', { message: 'oops' });
      expect(mockServer.to).toHaveBeenCalledWith('socket-id-1');
      expect(mockServer.emit).toHaveBeenCalledWith('error', { message: 'oops' });
    });
  });
});
