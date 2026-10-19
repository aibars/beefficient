import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FarmsService } from './farms.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { EstablishmentsRepository } from '../establishments/establishments.repository';
import { Establishment } from '../establishments/establishments.entity';
import { Company } from '../companies/companies.entity';
import { User } from '../users/users.entity';
import { UserFarmRepository } from './user-farm.repository';
import { JoinCodeService } from './join-code.service';
import { UserFarm } from './user-farm.entity';

describe('FarmsService', () => {
  let service: FarmsService;
  let farmsRepo: { createEstablishment: jest.Mock; findById: jest.Mock };
  let companiesRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    manager: { update: jest.Mock };
  };
  let userFarmRepo: {
    createUserFarm: jest.Mock;
    findByUserAndFarm: jest.Mock;
    findByUserId: jest.Mock;
    setActiveFarm: jest.Mock;
  };
  let joinCodeService: {
    generateAndCreate: jest.Mock;
    validateAndMarkUsed: jest.Mock;
  };

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
    companiesRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(),
      manager: { update: jest.fn() },
    };
    userFarmRepo = {
      createUserFarm: jest.fn(),
      findByUserAndFarm: jest.fn(),
      findByUserId: jest.fn(),
      setActiveFarm: jest.fn(),
    };
    joinCodeService = {
      generateAndCreate: jest.fn(),
      validateAndMarkUsed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmsService,
        { provide: EstablishmentsRepository, useValue: farmsRepo },
        { provide: getRepositoryToken(Company), useValue: companiesRepo },
        { provide: UserFarmRepository, useValue: userFarmRepo },
        { provide: JoinCodeService, useValue: joinCodeService },
      ],
    }).compile();

    service = module.get(FarmsService);
  });

  describe('createFarm', () => {
    it('creates farm, assigns admin as active, and generates a join code', async () => {
      companiesRepo.findOne.mockResolvedValue({
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

      expect(companiesRepo.findOne).toHaveBeenCalledWith({
        where: { ownerId: userId },
      });
      expect(companiesRepo.save).not.toHaveBeenCalled();
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
    it('creates the company and links it to the user first', async () => {
      companiesRepo.findOne.mockResolvedValue(null);
      companiesRepo.save.mockResolvedValue({ id: companyId, ownerId: userId });
      farmsRepo.createEstablishment.mockResolvedValue(farm);
      userFarmRepo.createUserFarm.mockResolvedValue(buildUserFarm());
      joinCodeService.generateAndCreate.mockResolvedValue('ABCdef123');

      await service.createFarm('La Esperanza', 'Buenos Aires', userId);

      expect(companiesRepo.save).toHaveBeenCalledWith({ ownerId: userId });
      expect(companiesRepo.manager.update).toHaveBeenCalledWith(
        User,
        { id: userId, companyId: IsNull() },
        { companyId },
      );
      expect(farmsRepo.createEstablishment).toHaveBeenCalledWith(
        'La Esperanza',
        'Buenos Aires',
        companyId,
      );
    });
  });

  describe('joinFarm', () => {
    it('joins with valid code as tecnico, inactive', async () => {
      joinCodeService.validateAndMarkUsed.mockResolvedValue({
        farmId: farm.id,
      });
      farmsRepo.findById.mockResolvedValue(farm);
      userFarmRepo.findByUserAndFarm.mockResolvedValue(null);
      userFarmRepo.createUserFarm.mockResolvedValue(
        buildUserFarm({ role: 'tecnico' }),
      );

      const result = await service.joinFarm('ABCdef123', userId);

      expect(joinCodeService.validateAndMarkUsed).toHaveBeenCalledWith(
        'ABCdef123',
        userId,
      );
      expect(userFarmRepo.createUserFarm).toHaveBeenCalledWith(
        userId,
        farm.id,
        'tecnico',
      );
      expect(result).toEqual({
        farm_id: farm.id,
        farm_name: farm.name,
        provincia: farm.provincia,
        role: 'tecnico',
        active: false,
      });
    });

    it('rejects invalid code with 400', async () => {
      joinCodeService.validateAndMarkUsed.mockRejectedValue(
        new Error('InvalidJoinCode'),
      );

      await expect(service.joinFarm('BADcode1', userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(userFarmRepo.createUserFarm).not.toHaveBeenCalled();
    });

    it('rejects with 404 if farm no longer exists', async () => {
      joinCodeService.validateAndMarkUsed.mockResolvedValue({
        farmId: farm.id,
      });
      farmsRepo.findById.mockResolvedValue(null);

      await expect(service.joinFarm('ABCdef123', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects with 409 if already a member', async () => {
      joinCodeService.validateAndMarkUsed.mockResolvedValue({
        farmId: farm.id,
      });
      farmsRepo.findById.mockResolvedValue(farm);
      userFarmRepo.findByUserAndFarm.mockResolvedValue(buildUserFarm());

      await expect(service.joinFarm('ABCdef123', userId)).rejects.toThrow(
        ConflictException,
      );
      expect(userFarmRepo.createUserFarm).not.toHaveBeenCalled();
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
