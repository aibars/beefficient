import { EntityManager } from 'typeorm';
import { CompanyService } from './companies.service';
import { Company } from './companies.entity';
import { User } from '../users/users.entity';

describe('CompanyService', () => {
  const userId = 'user-uuid-1';
  const company = { id: 'company-uuid-1', ownerId: userId } as Company;

  const buildManager = () =>
    ({
      create: jest.fn((_entity, data) => data),
      save: jest.fn().mockResolvedValue(company),
      update: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
    }) as unknown as jest.Mocked<EntityManager>;

  it('createCompanyForUser saves the company and links it to the user', async () => {
    const em = buildManager();
    const service = new CompanyService(em);

    const result = await service.createCompanyForUser(userId);

    expect(em.create).toHaveBeenCalledWith(Company, { ownerId: userId });
    expect(em.save).toHaveBeenCalledWith({ ownerId: userId });
    expect(em.update).toHaveBeenCalledWith(
      User,
      { id: userId },
      { companyId: company.id },
    );
    expect(result).toBe(company);
  });

  it('createCompanyForUser uses the given transaction manager', async () => {
    const em = buildManager();
    const tx = buildManager();
    const service = new CompanyService(em);

    await service.createCompanyForUser(userId, tx);

    expect(tx.save).toHaveBeenCalled();
    expect(tx.update).toHaveBeenCalled();
    expect(em.save).not.toHaveBeenCalled();
    expect(em.update).not.toHaveBeenCalled();
  });

  it('findByUserId looks up by owner', async () => {
    const em = buildManager();
    (em.findOne as jest.Mock).mockResolvedValue(company);
    const service = new CompanyService(em);

    await expect(service.findByUserId(userId)).resolves.toBe(company);
    expect(em.findOne).toHaveBeenCalledWith(Company, {
      where: { ownerId: userId },
    });
  });

  it('findByUserId returns null when the user has no company', async () => {
    const em = buildManager();
    (em.findOne as jest.Mock).mockResolvedValue(null);
    const service = new CompanyService(em);

    await expect(service.findByUserId(userId)).resolves.toBeNull();
  });
});
