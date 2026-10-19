import { join } from 'path';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { Company } from 'src/companies/companies.entity';
import { Establishment } from 'src/establishments/establishments.entity';
import { User } from 'src/users/users.entity';

// Same standalone DataSource as companies.integration.spec.ts: TypeScript
// entities and migrations, without booting AppModule.
describe('Establishment', () => {
  jest.setTimeout(30000);

  let dataSource: DataSource;
  let em: EntityManager;
  const users: User[] = [];

  const createTestCompany = async (): Promise<Company> => {
    const user = await em.save(
      em.create(User, { email: `establishment-${randomUUID()}@test.com` }),
    );
    users.push(user);
    return em.save(em.create(Company, { ownerId: user.id }));
  };

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [join(__dirname, '..', '**', '*.entity.ts')],
      migrations: [
        join(__dirname, '..', '..', 'database', 'migrations', '*.ts'),
      ],
      migrationsRun: true,
      synchronize: false,
      logging: false,
    });
    await dataSource.initialize();
    em = dataSource.manager;
  });

  afterAll(async () => {
    // Cascades to companies and their establishments.
    if (users.length) await em.remove(users);
    await dataSource?.destroy();
  });

  it('creates establishment linked to company', async () => {
    const company = await createTestCompany();
    const est = await em.save(Establishment, {
      companyId: company.id,
      name: 'Mi Establecimiento',
      provincia: 'Entre Ríos',
    });
    expect(est.id).toBeDefined();
    expect(est.companyId).toBe(company.id);

    const loaded = await em.findOne(Establishment, {
      where: { id: est.id },
      relations: { company: true },
    });
    expect(loaded?.company.ownerId).toBe(company.ownerId);
  });

  it('cascades delete when company deleted', async () => {
    const company = await createTestCompany();
    const est = await em.save(Establishment, {
      companyId: company.id,
      name: 'Test',
      provincia: 'BsAs',
    });
    await em.remove(company);
    const found = await em.findOne(Establishment, { where: { id: est.id } });
    expect(found).toBeNull();
  });

  it('rejects an establishment whose company does not exist', async () => {
    await expect(
      em.save(Establishment, {
        companyId: randomUUID(),
        name: 'Huérfano',
        provincia: 'Salta',
      }),
    ).rejects.toMatchObject({
      driverError: { constraint: 'fk_establishments_company_id' },
    });
  });

  it('keeps user_farm and farm_join_codes pointing at establishments', async () => {
    const rows: { table: string; ref: string }[] = await dataSource.query(`
      SELECT conrelid::regclass::text AS table, confrelid::regclass::text AS ref
      FROM pg_constraint
      WHERE conname IN ('fk_user_farm_farm_id', 'fk_farm_join_codes_farm_id')
      ORDER BY conname
    `);
    expect(rows).toEqual([
      { table: 'farm_join_codes', ref: 'establishments' },
      { table: 'user_farm', ref: 'establishments' },
    ]);
  });

  it('indexes establishments(company_id) and drops the farms table', async () => {
    const [index] = await dataSource.query(
      `SELECT indexdef FROM pg_indexes WHERE indexname = 'idx_establishments_company_id'`,
    );
    expect(index?.indexdef).toMatch(
      /ON public\.establishments .*\(company_id\)/,
    );

    const farms = await dataSource.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'farms'`,
    );
    expect(farms).toHaveLength(0);
  });
});
