import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FarmJoinCode } from './farm-join-code.entity';

@Injectable()
export class FarmJoinCodeRepository extends Repository<FarmJoinCode> {
  constructor(private dataSource: DataSource) {
    super(FarmJoinCode, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<FarmJoinCode | null> {
    return this.findOne({ where: { code } });
  }

  async findByFarmId(farmId: string): Promise<FarmJoinCode[]> {
    return this.find({ where: { farmId } });
  }

  async createJoinCode(farmId: string, code: string): Promise<FarmJoinCode> {
    const joinCode = this.create({ farmId, code });
    return this.save(joinCode);
  }

  async markAsUsed(codeId: string, userId: string): Promise<void> {
    await this.update(codeId, { usedById: userId, usedAt: new Date() });
  }
}
