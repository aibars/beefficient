import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { isUniqueViolation } from '../common/database/pg-errors';
import { EstablishmentsRepository } from '../establishments/establishments.repository';
import { Establishment } from '../establishments/establishments.entity';
import { CompanyService } from '../companies/companies.service';
import { UsersService } from '../users/users.service';
import { UserFarmRepository } from './user-farm.repository';
import {
  INVALID_JOIN_CODE_MESSAGE,
  JoinCodeService,
} from './join-code.service';
import { FarmResponseDto } from './dto';

@Injectable()
export class FarmsService {
  constructor(
    private readonly establishmentsRepository: EstablishmentsRepository,
    private readonly companyService: CompanyService,
    private readonly userFarmRepository: UserFarmRepository,
    private readonly joinCodeService: JoinCodeService,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  async createFarm(
    name: string,
    provincia: string,
    userId: string,
  ): Promise<FarmResponseDto & { join_code: string }> {
    // Signup creates the user's Company; a missing one is a data-integrity
    // problem, not something to paper over here.
    const company = await this.companyService.findByUserId(userId);
    if (!company) {
      throw new BadRequestException('User company not initialized');
    }

    const farm = await this.establishmentsRepository.createEstablishment(
      name,
      provincia,
      company.id,
    );
    await this.userFarmRepository.createUserFarm(userId, farm.id, 'admin');
    // The newly created farm becomes the creator's active farm.
    await this.userFarmRepository.setActiveFarm(userId, farm.id);
    const joinCode = await this.joinCodeService.generateAndCreate(farm.id);

    return {
      ...this.toResponse(farm, 'admin', true),
      join_code: joinCode,
    };
  }

  /**
   * Joins the user to the code's farm as `tecnico`, not active (the user
   * switches via PATCH). The code is only burned when the join succeeds:
   * the membership check runs before redemption, and redemption plus the
   * user_farm insert share one transaction.
   */
  async joinFarm(joinCode: string, userId: string): Promise<FarmResponseDto> {
    const code = await this.joinCodeService.findRedeemable(joinCode);
    if (!code) {
      throw new BadRequestException(INVALID_JOIN_CODE_MESSAGE);
    }

    const farm = await this.establishmentsRepository.findById(code.farmId);
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const existing = await this.userFarmRepository.findByUserAndFarm(
      userId,
      farm.id,
    );
    if (existing) {
      throw new ConflictException('User is already a member of this farm');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        // Atomic; throws 400 if a concurrent request redeemed it first.
        await this.joinCodeService.validateAndMarkUsed(
          joinCode,
          userId,
          manager,
        );
        await this.userFarmRepository.createUserFarm(
          userId,
          farm.id,
          'tecnico',
          manager,
        );
      });
    } catch (err) {
      // A concurrent join of the same user to this farm won the race to the
      // user_farm primary key; the redemption rolled back with it.
      if (isUniqueViolation(err)) {
        throw new ConflictException('User is already a member of this farm');
      }
      throw err;
    }

    return this.toResponse(farm, 'tecnico', false);
  }

  /**
   * All farms the user belongs to. `active` comes from users.active_farm_id
   * (the source of truth), so at most one farm is reported active.
   */
  async listFarmsByUserId(userId: string): Promise<FarmResponseDto[]> {
    const user = await this.usersService.findById(userId);
    const activeFarmId = user?.activeFarmId ?? null;
    const userFarms = await this.userFarmRepository.findByUserId(userId);
    const results: FarmResponseDto[] = [];
    for (const userFarm of userFarms) {
      const farm =
        userFarm.farm ??
        (await this.establishmentsRepository.findById(userFarm.farmId));
      if (!farm) continue;
      results.push(
        this.toResponse(farm, userFarm.role, farm.id === activeFarmId),
      );
    }
    return results;
  }

  async setActiveFarm(
    farmId: string,
    userId: string,
  ): Promise<{ farm_id: string; active: boolean }> {
    const userFarm = await this.userFarmRepository.findByUserAndFarm(
      userId,
      farmId,
    );
    if (!userFarm) {
      throw new ForbiddenException('User is not a member of this farm');
    }

    const farm = await this.establishmentsRepository.findById(farmId);
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    await this.userFarmRepository.setActiveFarm(userId, farmId);
    return { farm_id: farmId, active: true };
  }

  async generateJoinCode(
    farmId: string,
    userId: string,
  ): Promise<{ join_code: string }> {
    const userFarm = await this.userFarmRepository.findByUserAndFarm(
      userId,
      farmId,
    );
    if (!userFarm) {
      throw new NotFoundException('Farm not found');
    }
    if (userFarm.role !== 'admin') {
      throw new ForbiddenException('Only farm admin can generate join codes');
    }

    const joinCode = await this.joinCodeService.generateAndCreate(farmId);
    return { join_code: joinCode };
  }

  private toResponse(
    farm: Establishment,
    role: 'admin' | 'tecnico',
    active: boolean,
  ): FarmResponseDto {
    return {
      farm_id: farm.id,
      farm_name: farm.name,
      provincia: farm.provincia,
      role,
      active,
    };
  }
}
