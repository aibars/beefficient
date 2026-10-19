import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Establishment } from './establishments.entity';

@Injectable()
export class EstablishmentsRepository extends Repository<Establishment> {
  constructor(private dataSource: DataSource) {
    super(Establishment, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Establishment | null> {
    return this.findOne({ where: { id } });
  }

  async findByCompanyId(companyId: string): Promise<Establishment[]> {
    return this.find({ where: { companyId } });
  }

  async createEstablishment(
    name: string,
    provincia: string,
    companyId: string,
  ): Promise<Establishment> {
    const establishment = this.create({ name, provincia, companyId });
    return this.save(establishment);
  }
}
