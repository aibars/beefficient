import { Test, TestingModule } from '@nestjs/testing';
import { JoinCodeService } from './join-code.service';
import { FarmJoinCodeRepository } from './farm-join-code.repository';
import { FarmJoinCode } from './farm-join-code.entity';

describe('JoinCodeService', () => {
  let service: JoinCodeService;
  let repo: {
    findByCode: jest.Mock;
    markAsUsed: jest.Mock;
    createJoinCode: jest.Mock;
  };

  const farmId = 'farm-uuid-1';
  const userId = 'user-uuid-1';

  const buildCode = (overrides: Partial<FarmJoinCode> = {}): FarmJoinCode =>
    ({
      id: 'code-uuid-1',
      farmId,
      code: 'ABCdef123',
      usedById: null,
      usedAt: null,
      createdAt: new Date(),
      ...overrides,
    }) as FarmJoinCode;

  beforeEach(async () => {
    repo = {
      findByCode: jest.fn(),
      markAsUsed: jest.fn(),
      createJoinCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JoinCodeService,
        { provide: FarmJoinCodeRepository, useValue: repo },
      ],
    }).compile();

    service = module.get(JoinCodeService);
  });

  describe('generateCode', () => {
    it('returns an 8-12 character alphanumeric code', () => {
      for (let i = 0; i < 200; i++) {
        expect(service.generateCode()).toMatch(/^[A-Za-z0-9]{8,12}$/);
      }
    });

    it('generates different codes on each call', () => {
      expect(service.generateCode()).not.toEqual(service.generateCode());
    });

    it('is cryptographically secure (100 calls produce 100 unique codes)', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(service.generateCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('validateAndMarkUsed', () => {
    it('throws InvalidJoinCode if code does not exist', async () => {
      repo.findByCode.mockResolvedValue(null);

      await expect(
        service.validateAndMarkUsed('missing1', userId),
      ).rejects.toThrow('InvalidJoinCode');
      expect(repo.markAsUsed).not.toHaveBeenCalled();
    });

    it('throws InvalidJoinCode if code already used', async () => {
      repo.findByCode.mockResolvedValue(buildCode({ usedById: 'other-user' }));

      await expect(
        service.validateAndMarkUsed('ABCdef123', userId),
      ).rejects.toThrow('InvalidJoinCode');
      expect(repo.markAsUsed).not.toHaveBeenCalled();
    });

    it('marks code as used and returns farmId on success', async () => {
      repo.findByCode.mockResolvedValue(buildCode());
      repo.markAsUsed.mockResolvedValue(undefined);

      const result = await service.validateAndMarkUsed('ABCdef123', userId);

      expect(repo.findByCode).toHaveBeenCalledWith('ABCdef123');
      expect(repo.markAsUsed).toHaveBeenCalledWith('code-uuid-1', userId);
      expect(result).toEqual({ farmId });
    });
  });

  describe('generateAndCreate', () => {
    it('retries until a unique code is found, then saves it', async () => {
      jest
        .spyOn(service, 'generateCode')
        .mockReturnValueOnce('TAKEN1234')
        .mockReturnValueOnce('FREE12345');
      repo.findByCode
        .mockResolvedValueOnce(buildCode({ code: 'TAKEN1234' }))
        .mockResolvedValueOnce(null);
      repo.createJoinCode.mockResolvedValue(buildCode({ code: 'FREE12345' }));

      const code = await service.generateAndCreate(farmId);

      expect(code).toBe('FREE12345');
      expect(repo.findByCode).toHaveBeenCalledTimes(2);
      expect(repo.createJoinCode).toHaveBeenCalledTimes(1);
      expect(repo.createJoinCode).toHaveBeenCalledWith(farmId, 'FREE12345');
    });

    it('throws after too many collisions', async () => {
      repo.findByCode.mockResolvedValue(buildCode());

      await expect(service.generateAndCreate(farmId)).rejects.toThrow(
        'Unable to generate a unique join code',
      );
      expect(repo.createJoinCode).not.toHaveBeenCalled();
    });
  });
});
