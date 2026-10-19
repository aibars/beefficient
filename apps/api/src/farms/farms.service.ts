import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EstablishmentsRepository } from '../establishments/establishments.repository';
import { Establishment } from '../establishments/establishments.entity';
import { CompanyService } from '../companies/companies.service';
import { UserFarmRepository } from './user-farm.repository';
import { JoinCodeService } from './join-code.service';
import { FarmResponseDto } from './dto';

@Injectable()
export class FarmsService {
  constructor(
    private readonly establishmentsRepository: EstablishmentsRepository,
    private readonly companyService: CompanyService,
    private readonly userFarmRepository: UserFarmRepository,
    private readonly joinCodeService: JoinCodeService,
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

  async joinFarm(joinCode: string, userId: string): Promise<FarmResponseDto> {
    let farmId: string;
    try {
      ({ farmId } = await this.joinCodeService.validateAndMarkUsed(
        joinCode,
        userId,
      ));
    } catch {
      throw new BadRequestException('Invalid or already-used join code');
    }

    const farm = await this.establishmentsRepository.findById(farmId);
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const existing = await this.userFarmRepository.findByUserAndFarm(
      userId,
      farmId,
    );
    if (existing) {
      throw new ConflictException('User is already a member of this farm');
    }

    await this.userFarmRepository.createUserFarm(userId, farmId, 'tecnico');
    return this.toResponse(farm, 'tecnico', false);
  }

  async listFarmsByUserId(userId: string): Promise<FarmResponseDto[]> {
    const userFarms = await this.userFarmRepository.findByUserId(userId);
    const results: FarmResponseDto[] = [];
    for (const userFarm of userFarms) {
      const farm =
        userFarm.farm ??
        (await this.establishmentsRepository.findById(userFarm.farmId));
      if (!farm) continue;
      results.push(this.toResponse(farm, userFarm.role, userFarm.active));
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
