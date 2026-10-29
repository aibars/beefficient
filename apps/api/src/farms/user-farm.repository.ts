import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../users/users.entity';
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
    const userFarm = repo.create({ userId, farmId, role });
    // insert, not save: save updates an existing membership instead of hitting
    // the primary key, and FarmsService.joinFarm relies on that violation.
    await repo.insert(userFarm);
    return userFarm;
  }

  /**
   * Makes `farmId` the user's only active farm, in one transaction: clears
   * every user_farm.active flag, sets the target one, and points
   * users.active_farm_id at it. Throws (rolling back) if the user is not a
   * member, so the two representations never disagree. Pass `manager` to
   * run inside a caller's transaction instead of opening one.
   */
  async setActiveFarm(
    userId: string,
    farmId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const work = async (m: EntityManager) => {
      await m.update(UserFarm, { userId }, { active: false });
      const result = await m.update(
        UserFarm,
        { userId, farmId },
        { active: true },
      );
      if (!result.affected) {
        throw new Error(
          `User ${userId} is not a member of farm ${farmId}; active farm unchanged`,
        );
      }
      await m.update(User, { id: userId }, { activeFarmId: farmId });
    };
    if (manager) {
      await work(manager);
    } else {
      await this.dataSource.transaction(work);
    }
  }

  async clearActiveForUser(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(UserFarm, { userId }, { active: false });
      await manager.update(User, { id: userId }, { activeFarmId: null });
    });
  }
}
