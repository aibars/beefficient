import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Farm } from './farms.entity';

@Injectable()
export class FarmsRepository extends Repository<Farm> {
  constructor(private dataSource: DataSource) {
    super(Farm, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Farm | null> {
    return this.findOne({ where: { id } });
  }

  async findByOwnerId(ownerId: string): Promise<Farm[]> {
    return this.find({ where: { ownerId } });
  }

  async createFarm(
    name: string,
    provincia: string,
    ownerId: string,
  ): Promise<Farm> {
    const farm = this.create({ name, provincia, ownerId });
    return this.save(farm);
  }
}
