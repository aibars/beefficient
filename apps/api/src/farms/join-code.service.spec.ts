import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EntityManager, QueryFailedError } from 'typeorm';
import { JoinCodeService } from './join-code.service';
import { FarmJoinCodeRepository } from './farm-join-code.repository';
import { FarmJoinCode } from './farm-join-code.entity';

describe('JoinCodeService', () => {
  let service: JoinCodeService;
  let repo: {
    findUnusedByCode: jest.Mock;
    redeem: jest.Mock;
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
      findUnusedByCode: jest.fn(),
      redeem: jest.fn(),
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

  describe('findRedeemable', () => {
    it('returns the unused code from the repository', async () => {
      const code = buildCode();
      repo.findUnusedByCode.mockResolvedValue(code);

      await expect(service.findRedeemable('ABCdef123')).resolves.toBe(code);
      expect(repo.findUnusedByCode).toHaveBeenCalledWith('ABCdef123');
      expect(repo.redeem).not.toHaveBeenCalled();
    });
  });

  describe('validateAndMarkUsed', () => {
    it('throws if the code does not exist or is already used', async () => {
      repo.redeem.mockResolvedValue(null);

      await expect(
        service.validateAndMarkUsed('missing1', userId),
      ).rejects.toThrow(new BadRequestException('Invalid or used join code'));
    });

    it('marks code as used and returns farmId on success', async () => {
      repo.redeem.mockResolvedValue(farmId);

      const result = await service.validateAndMarkUsed('ABCdef123', userId);

      expect(repo.redeem).toHaveBeenCalledWith('ABCdef123', userId, undefined);
      expect(result).toEqual({ farmId });
    });

    it('passes the caller transaction manager to the repository', async () => {
      repo.redeem.mockResolvedValue(farmId);
      const manager = {} as EntityManager;

      await service.validateAndMarkUsed('ABCdef123', userId, manager);

      expect(repo.redeem).toHaveBeenCalledWith('ABCdef123', userId, manager);
    });

    it('rejects reuse of join code', async () => {
      // First redemption wins; the conditional UPDATE matches nothing after.
      repo.redeem.mockResolvedValueOnce(farmId).mockResolvedValueOnce(null);

      await service.validateAndMarkUsed('ABCdef123', 'user-1');
      await expect(
        service.validateAndMarkUsed('ABCdef123', 'user-2'),
      ).rejects.toThrow('Invalid or used join code');
    });
  });

  describe('generateAndCreate', () => {
    const uniqueViolation = () =>
      new QueryFailedError(
        'INSERT INTO farm_join_codes',
        [],
        Object.assign(new Error('duplicate key'), { code: '23505' }),
      );

    it('saves and returns the generated code', async () => {
      jest.spyOn(service, 'generateCode').mockReturnValueOnce('FREE12345');
      repo.createJoinCode.mockResolvedValue(buildCode({ code: 'FREE12345' }));

      await expect(service.generateAndCreate(farmId)).resolves.toBe(
        'FREE12345',
      );
      expect(repo.createJoinCode).toHaveBeenCalledWith(farmId, 'FREE12345');
    });

    it('retries with a fresh code on a unique violation', async () => {
      jest
        .spyOn(service, 'generateCode')
        .mockReturnValueOnce('TAKEN1234')
        .mockReturnValueOnce('FREE12345');
      repo.createJoinCode
        .mockRejectedValueOnce(uniqueViolation())
        .mockResolvedValueOnce(buildCode({ code: 'FREE12345' }));

      const code = await service.generateAndCreate(farmId);

      expect(code).toBe('FREE12345');
      expect(repo.createJoinCode).toHaveBeenCalledTimes(2);
      expect(repo.createJoinCode).toHaveBeenLastCalledWith(farmId, 'FREE12345');
    });

    it('inside a caller transaction, runs each attempt in its own savepoint', async () => {
      const savepoint = { savepoint: true } as unknown as EntityManager;
      const manager = {
        transaction: jest.fn(
          async (work: (m: EntityManager) => Promise<unknown>) =>
            work(savepoint),
        ),
      } as unknown as EntityManager;
      jest
        .spyOn(service, 'generateCode')
        .mockReturnValueOnce('TAKEN1234')
        .mockReturnValueOnce('FREE12345');
      repo.createJoinCode
        .mockRejectedValueOnce(uniqueViolation())
        .mockResolvedValueOnce(buildCode({ code: 'FREE12345' }));

      const code = await service.generateAndCreate(farmId, manager);

      expect(code).toBe('FREE12345');
      // One savepoint per attempt, so a collision only rolls back itself.
      expect(manager.transaction).toHaveBeenCalledTimes(2);
      expect(repo.createJoinCode).toHaveBeenLastCalledWith(
        farmId,
        'FREE12345',
        savepoint,
      );
    });

    it('throws after too many collisions', async () => {
      repo.createJoinCode.mockRejectedValue(uniqueViolation());

      await expect(service.generateAndCreate(farmId)).rejects.toThrow(
        'Unable to generate a unique join code',
      );
      expect(repo.createJoinCode).toHaveBeenCalledTimes(10);
    });

    it('rethrows errors other than a unique violation', async () => {
      const fkError = new QueryFailedError(
        'INSERT INTO farm_join_codes',
        [],
        Object.assign(new Error('fk'), { code: '23503' }),
      );
      repo.createJoinCode.mockRejectedValue(fkError);

      await expect(service.generateAndCreate(farmId)).rejects.toBe(fkError);
      expect(repo.createJoinCode).toHaveBeenCalledTimes(1);
    });

    it('generates unique codes for concurrent requests', async () => {
      repo.createJoinCode.mockImplementation(async (id: string, code: string) =>
        buildCode({ farmId: id, code }),
      );

      const codes = await Promise.all(
        Array.from({ length: 5 }, () => service.generateAndCreate(farmId)),
      );

      expect(new Set(codes).size).toBe(5);
    });
  });
});
