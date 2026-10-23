import { join } from 'path';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { Company } from 'src/companies/companies.entity';
import { User } from 'src/users/users.entity';

// Builds its own DataSource from the TypeScript sources (like data-source.ts)
// instead of booting AppModule, to test the entities without the whole app.
describe('Company', () => {
  jest.setTimeout(30000);

  let dataSource: DataSource;
  let em: EntityManager;

  const createTestUser = (): Promise<User> =>
    em.save(em.create(User, { email: `company-${randomUUID()}@test.com` }));

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [join(__dirname, '..', '**', '*.entity.ts')],
      migrations: [join(__dirname, '..', 'database', 'migrations', '*.ts')],
      migrationsRun: true,
      synchronize: false,
      logging: false,
    });
    await dataSource.initialize();
    em = dataSource.manager;
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('creates company with owner relationship', async () => {
    const user = await createTestUser();
    const company = await em.save(Company, { ownerId: user.id });
    expect(company.id).toBeDefined();
    expect(company.ownerId).toBe(user.id);
    await em.remove(user);
  });

  it('cascades delete when user deleted', async () => {
    const user = await createTestUser();
    const company = await em.save(Company, { ownerId: user.id });
    await em.remove(user);
    const found = await em.findOne(Company, { where: { id: company.id } });
    expect(found).toBeNull();
  });

  it('links the company to its user through users.company_id', async () => {
    const user = await createTestUser();
    const company = await em.save(Company, { ownerId: user.id });
    await em.update(User, user.id, { companyId: company.id });

    const loaded = await em.findOne(User, {
      where: { id: user.id },
      relations: { company: true },
    });
    expect(loaded?.company?.id).toBe(company.id);
    await em.remove(loaded!);
  });

  it('keeps the user when its company is deleted', async () => {
    const user = await createTestUser();
    const company = await em.save(Company, { ownerId: user.id });
    await em.update(User, user.id, { companyId: company.id });

    await em.delete(Company, company.id);

    const found = await em.findOne(User, { where: { id: user.id } });
    expect(found).not.toBeNull();
    expect(found?.companyId).toBeNull();
    await em.remove(found!);
  });
});
