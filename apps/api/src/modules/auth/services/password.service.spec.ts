import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should return a hashed string different from the original', async () => {
      const plain = 'password123';
      const hashed = await service.hash(plain);
      expect(hashed).not.toBe(plain);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for the same input', async () => {
      const hash1 = await service.hash('password123');
      const hash2 = await service.hash('password123');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for a matching password', async () => {
      const plain = 'password123';
      const hashed = await service.hash(plain);
      expect(await service.compare(plain, hashed)).toBe(true);
    });

    it('should return false for a wrong password', async () => {
      const hashed = await service.hash('password123');
      expect(await service.compare('wrong', hashed)).toBe(false);
    });
  });
});
