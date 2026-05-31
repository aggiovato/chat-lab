import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from '../services/health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return the result of HealthService.check', () => {
      const expected = { status: 'ok', timestamp: '2026-01-01T00:00:00.000Z' };
      jest.spyOn(service, 'check').mockReturnValue(expected);

      expect(controller.check()).toEqual(expected);
    });

    it('should delegate to HealthService', () => {
      const spy = jest.spyOn(service, 'check');
      controller.check();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
