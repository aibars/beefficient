import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Company } from './companies.entity';
import { User } from '../users/users.entity';

@Injectable()
export class CompanyService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Creates the user's Company (1:1) and links it back via `users.company_id`.
   * Pass the transaction's `manager` to run inside a caller's transaction
   * (signup creates the user and its company atomically).
   */
  async createCompanyForUser(
    userId: string,
    manager: EntityManager = this.em,
  ): Promise<Company> {
    const company = await manager.save(
      manager.create(Company, { ownerId: userId }),
    );
    await manager.update(User, { id: userId }, { companyId: company.id });
    return company;
  }

  async findByUserId(userId: string): Promise<Company | null> {
    return this.em.findOne(Company, { where: { ownerId: userId } });
  }
}
