import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FarmsService } from './farms.service';
import { EstablishmentsRepository } from '../establishments/establishments.repository';
import { Establishment } from '../establishments/establishments.entity';
import { CompanyService } from '../companies/companies.service';
import { UserFarmRepository } from './user-farm.repository';
import { JoinCodeService } from './join-code.service';
import { UserFarm } from './user-farm.entity';
import { FarmJoinCode } from './farm-join-code.entity';
import { DataSource, EntityManager, QueryFailedError } from 'typeorm';

describe('FarmsService', () => {
  let service: FarmsService;
  let farmsRepo: { createEstablishment: jest.Mock; findById: jest.Mock };
  let companyService: { findByUserId: jest.Mock };
  let userFarmRepo: {
    createUserFarm: jest.Mock;
    findByUserAndFarm: jest.Mock;
    findByUserId: jest.Mock;
    setActiveFarm: jest.Mock;
  };
  let joinCodeService: {
    generateAndCreate: jest.Mock;
    findRedeemable: jest.Mock;
    validateAndMarkUsed: jest.Mock;
  };
  let dataSource: { transaction: jest.Mock };
  const txManager = { tx: true } as unknown as EntityManager;

  const userId = 'user-uuid-1';
  const companyId = 'company-uuid-1';
  const farm: Establishment = {
    id: 'farm-uuid-1',
    name: 'La Esperanza',
    provincia: 'Buenos Aires',
    companyId,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Establishment;
  const farm2: Establishment = {
    id: 'farm-uuid-2',
    name: 'El Ombu',
    provincia: 'Cordoba',
    companyId: 'other-company',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Establishment;

  const buildUserFarm = (overrides: Partial<UserFarm> = {}): UserFarm =>
    ({
      userId,
      farmId: farm.id,
      role: 'admin',
      active: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as UserFarm;

  beforeEach(async () => {
    farmsRepo = { createEstablishment: jest.fn(), findById: jest.fn() };
    companyService = { findByUserId: jest.fn() };
    userFarmRepo = {
      createUserFarm: jest.fn(),
      findByUserAndFarm: jest.fn(),
      findByUserId: jest.fn(),
      setActiveFarm: jest.fn(),
    };
    joinCodeService = {
      generateAndCreate: jest.fn(),
      findRedeemable: jest.fn(),
      validateAndMarkUsed: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(
        async (work: (manager: EntityManager) => Promise<unknown>) =>
          work(txManager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmsService,
        { provide: EstablishmentsRepository, useValue: farmsRepo },
        { provide: CompanyService, useValue: companyService },
        { provide: UserFarmRepository, useValue: userFarmRepo },
        { provide: JoinCodeService, useValue: joinCodeService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(FarmsService);
  });

  describe('createFarm', () => {
    it('creates farm, assigns admin as active, and generates a join code', async () => {
      companyService.findByUserId.mockResolvedValue({
        id: companyId,
        ownerId: userId,
      });
      farmsRepo.createEstablishment.mockResolvedValue(farm);
      userFarmRepo.createUserFarm.mockResolvedValue(buildUserFarm());
      userFarmRepo.setActiveFarm.mockResolvedValue(undefined);
      joinCodeService.generateAndCreate.mockResolvedValue('ABCdef123');

      const result = await service.createFarm(
        'La Esperanza',
        'Buenos Aires',
        userId,
      );

      expect(companyService.findByUserId).toHaveBeenCalledWith(userId);
      expect(farmsRepo.createEstablishment).toHaveBeenCalledWith(
        'La Esperanza',
        'Buenos Aires',
        companyId,
      );
      expect(userFarmRepo.createUserFarm).toHaveBeenCalledWith(
        userId,
        farm.id,
        'admin',
      );
      expect(userFarmRepo.setActiveFarm).toHaveBeenCalledWith(userId, farm.id);
      expect(joinCodeService.generateAndCreate).toHaveBeenCalledWith(farm.id);
      expect(result).toEqual({
        farm_id: farm.id,
        farm_name: 'La Esperanza',
        provincia: 'Buenos Aires',
        role: 'admin',
        active: true,
        join_code: 'ABCdef123',
      });
    });
  });

  describe('createFarm without a company', () => {
    it('test_create_farm_validates_company_exists', async () => {
      companyService.findByUserId.mockResolvedValue(null);

      await expect(
        service.createFarm('La Esperanza', 'Buenos Aires', userId),
      ).rejects.toThrow(
        new BadRequestException('User company not initialized'),
      );

      expect(farmsRepo.createEstablishment).not.toHaveBeenCalled();
      expect(userFarmRepo.createUserFarm).not.toHaveBeenCalled();
      expect(joinCodeService.generateAndCreate).not.toHaveBeenCalled();
    });
  });

  describe('joinFarm', () => {
    const redeemable = {
      id: 'code-uuid-1',
      farmId: farm.id,
      code: 'ABCdef123',
      usedById: null,
      usedAt: null,
    } as FarmJoinCode;

    it('joins with valid code as tecnico, inactive', async () => {
      joinCodeService.findRedeemable.mockResolvedValue(redeemable);
      farmsRepo.findById.mockResolvedValue(farm);
      userFarmRepo.findByUserAndFarm.mockResolvedValue(null);
      joinCodeService.validateAndMarkUsed.mockResolvedValue({
        farmId: farm.id,
      });
      userFarmRepo.createUserFarm.mockResolvedValue(
        buildUserFarm({ role: 'tecnico' }),
      );

      const result = await service.joinFarm('ABCdef123', userId);

      // Redemption and membership insert share one transaction.
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(joinCodeService.validateAndMarkUsed).toHaveBeenCalledWith(
        'ABCdef123',
        userId,
        txManager,
      );
      expect(userFarmRepo.createUserFarm).toHaveBeenCalledWith(
        userId,
        farm.id,
        'tecnico',
        txManager,
      );
      expect(userFarmRepo.setActiveFarm).not.toHaveBeenCalled();
      expect(result).toEqual({
        farm_id: farm.id,
        farm_name: farm.name,
        provincia: farm.provincia,
        role: 'tecnico',
        active: false,
      });
    });

    it('rejects invalid or used code with 400 without redeeming', async () => {
      joinCodeService.findRedeemable.mockResolvedValue(null);

      await expect(service.joinFarm('BADcode1', userId)).rejects.toThrow(
        new BadRequestException('Invalid or used join code'),
      );
      expect(joinCodeService.validateAndMarkUsed).not.toHaveBeenCalled();
      expect(userFarmRepo.createUserFarm).not.toHaveBeenCalled();
    });

    it('rejects with 400 when a concurrent request redeems the code first', async () => {
      joinCodeService.findRedeemable.mockResolvedValue(redeemable);
      farmsRepo.findById.mockResolvedValue(farm);
      userFarmRepo.findByUserAndFarm.mockResolvedValue(null);
      joinCodeService.validateAndMarkUsed.mockRejectedValue(
        new BadRequestException('Invalid or used join code'),
      );

      await expect(service.joinFarm('ABCdef123', userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(userFarmRepo.createUserFarm).not.toHaveBeenCalled();
    });

    it('rejects with 404 if farm no longer exists', async () => {
      joinCodeService.findRedeemable.mockResolvedValue(redeemable);
      farmsRepo.findById.mockResolvedValue(null);

      await expect(service.joinFarm('ABCdef123', userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(joinCodeService.validateAndMarkUsed).not.toHaveBeenCalled();
    });

    it('rejects with 409 if already a member, without burning the code', async () => {
      joinCodeService.findRedeemable.mockResolvedValue(redeemable);
      farmsRepo.findById.mockResolvedValue(farm);
      userFarmRepo.findByUserAndFarm.mockResolvedValue(buildUserFarm());

      await expect(service.joinFarm('ABCdef123', userId)).rejects.toThrow(
        ConflictException,
      );
      expect(joinCodeService.validateAndMarkUsed).not.toHaveBeenCalled();
      expect(userFarmRepo.createUserFarm).not.toHaveBeenCalled();
    });

    it('maps a racing duplicate membership insert to 409', async () => {
      joinCodeService.findRedeemable.mockResolvedValue(redeemable);
      farmsRepo.findById.mockResolvedValue(farm);
      userFarmRepo.findByUserAndFarm.mockResolvedValue(null);
      joinCodeService.validateAndMarkUsed.mockResolvedValue({
        farmId: farm.id,
      });
      userFarmRepo.createUserFarm.mockRejectedValue(
        new QueryFailedError(
          'INSERT INTO user_farm',
          [],
          Object.assign(new Error('duplicate key'), { code: '23505' }),
        ),
      );

      await expect(service.joinFarm('ABCdef123', userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('listFarmsByUserId', () => {
    it('returns farms in repository order (active DESC)', async () => {
      userFarmRepo.findByUserId.mockResolvedValue([
        buildUserFarm({ farmId: farm2.id, role: 'tecnico', active: true }),
        buildUserFarm({ farmId: farm.id, role: 'admin', active: false }),
      ]);
      farmsRepo.findById.mockImplementation(async (id: string) =>
        id === farm.id ? farm : id === farm2.id ? farm2 : null,
      );

      const result = await service.listFarmsByUserId(userId);

      expect(userFarmRepo.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([
        {
          farm_id: farm2.id,
          farm_name: farm2.name,
          provincia: farm2.provincia,
          role: 'tecnico',
          active: true,
        },
        {
          farm_id: farm.id,
          farm_name: farm.name,
          provincia: farm.provincia,
          role: 'admin',
          active: false,
        },
      ]);
    });

    it('uses the loaded farm relation when present', async () => {
      userFarmRepo.findByUserId.mockResolvedValue([
        buildUserFarm({ farm, active: true }),
      ]);

      const result = await service.listFarmsByUserId(userId);

      expect(farmsRepo.findById).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].farm_id).toBe(farm.id);
    });
  });

  describe('setActiveFarm', () => {
    it('sets the farm active (clearing others) for a member', async () => {
      userFarmRepo.findByUserAndFarm.mockResolvedValue(buildUserFarm());
      farmsRepo.findById.mockResolvedValue(farm);
      userFarmRepo.setActiveFarm.mockResolvedValue(undefined);

      const result = await service.setActiveFarm(farm.id, userId);

      expect(userFarmRepo.setActiveFarm).toHaveBeenCalledWith(userId, farm.id);
      expect(result).toEqual({ farm_id: farm.id, active: true });
    });

    it('forbids (403) if user is not a member', async () => {
      userFarmRepo.findByUserAndFarm.mockResolvedValue(null);

      await expect(service.setActiveFarm(farm.id, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(userFarmRepo.setActiveFarm).not.toHaveBeenCalled();
    });

    it('returns 404 if farm not found', async () => {
      userFarmRepo.findByUserAndFarm.mockResolvedValue(buildUserFarm());
      farmsRepo.findById.mockResolvedValue(null);

      await expect(service.setActiveFarm(farm.id, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userFarmRepo.setActiveFarm).not.toHaveBeenCalled();
    });
  });

  describe('generateJoinCode', () => {
    it('generates a new code if user is admin', async () => {
      userFarmRepo.findByUserAndFarm.mockResolvedValue(
        buildUserFarm({ role: 'admin' }),
      );
      joinCodeService.generateAndCreate.mockResolvedValue('NEWcode99');

      const result = await service.generateJoinCode(farm.id, userId);

      expect(joinCodeService.generateAndCreate).toHaveBeenCalledWith(farm.id);
      expect(result).toEqual({ join_code: 'NEWcode99' });
    });

    it('forbids (403) if user is tecnico', async () => {
      userFarmRepo.findByUserAndFarm.mockResolvedValue(
        buildUserFarm({ role: 'tecnico' }),
      );

      await expect(service.generateJoinCode(farm.id, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(joinCodeService.generateAndCreate).not.toHaveBeenCalled();
    });

    it('returns 404 if user is not a member', async () => {
      userFarmRepo.findByUserAndFarm.mockResolvedValue(null);

      await expect(service.generateJoinCode(farm.id, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
