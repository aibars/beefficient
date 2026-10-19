import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UserFarm } from './user-farm.entity';

@Injectable()
export class UserFarmRepository extends Repository<UserFarm> {
  constructor(private dataSource: DataSource) {
    super(UserFarm, dataSource.createEntityManager());
  }

  async findByUserAndFarm(
    userId: string,
    farmId: string,
  ): Promise<UserFarm | null> {
    return this.findOne({ where: { userId, farmId } });
  }

  async findByUserId(userId: string): Promise<UserFarm[]> {
    return this.find({
      where: { userId },
      order: { active: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByFarmId(farmId: string): Promise<UserFarm[]> {
    return this.find({ where: { farmId } });
  }

  async findActiveFarmByUserId(userId: string): Promise<UserFarm | null> {
    return this.findOne({ where: { userId, active: true } });
  }

  async createUserFarm(
    userId: string,
    farmId: string,
    role: 'admin' | 'tecnico',
    manager?: EntityManager,
  ): Promise<UserFarm> {
    const repo = manager ? manager.getRepository(UserFarm) : this;
    return repo.save(repo.create({ userId, farmId, role }));
  }

  /** Atomically clears the user's active farm and activates the target. */
  async setActiveFarm(userId: string, farmId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(UserFarm, { userId }, { active: false });
      await manager.update(UserFarm, { userId, farmId }, { active: true });
    });
  }

  async clearActiveForUser(userId: string): Promise<void> {
    await this.update({ userId }, { active: false });
  }
}
