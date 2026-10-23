import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { FarmJoinCode } from './farm-join-code.entity';

@Injectable()
export class FarmJoinCodeRepository extends Repository<FarmJoinCode> {
  constructor(private dataSource: DataSource) {
    super(FarmJoinCode, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<FarmJoinCode | null> {
    return this.findOne({ where: { code } });
  }

  /** The code, only if nobody has redeemed it yet. */
  async findUnusedByCode(code: string): Promise<FarmJoinCode | null> {
    return this.findOne({ where: { code, usedAt: IsNull() } });
  }

  async findByFarmId(farmId: string): Promise<FarmJoinCode[]> {
    return this.find({ where: { farmId } });
  }

  async createJoinCode(
    farmId: string,
    code: string,
    manager?: EntityManager,
  ): Promise<FarmJoinCode> {
    const repo = manager ? manager.getRepository(FarmJoinCode) : this;
    return repo.save(repo.create({ farmId, code }));
  }

  /**
   * Atomically redeems an unused code: a single conditional UPDATE, so two
   * concurrent redemptions of the same code cannot both succeed. Returns the
   * code's farm id, or null if the code does not exist or was already used.
   *
   * "Used" is keyed on `used_at`, not `used_by_id`: the latter is
   * `ON DELETE SET NULL`, so it does not prove the code was never redeemed.
   */
  async redeem(
    code: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<string | null> {
    const result = await (manager ?? this.manager)
      .createQueryBuilder()
      .update(FarmJoinCode)
      .set({ usedById: userId, usedAt: () => 'NOW()' })
      .where('code = :code AND used_at IS NULL', { code })
      .returning('farm_id')
      .execute();
    const rows = result.raw as Array<{ farm_id: string }>;
    return rows[0]?.farm_id ?? null;
  }
}
