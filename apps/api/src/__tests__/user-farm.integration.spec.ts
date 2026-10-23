import { join } from 'path';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { Company } from 'src/companies/companies.entity';
import { Establishment } from 'src/establishments/establishments.entity';
import { UserFarm } from 'src/farms/user-farm.entity';
import { User } from 'src/users/users.entity';

const UNIQUE_VIOLATION = '23505';

// Same standalone DataSource as companies.integration.spec.ts: TypeScript
// entities and migrations, without booting AppModule.
describe('UserFarm and establishments.join_code', () => {
  jest.setTimeout(30000);

  let dataSource: DataSource;
  let em: EntityManager;
  const users: User[] = [];

  const createTestUser = async (): Promise<User> => {
    const user = await em.save(
      em.create(User, { email: `user-farm-${randomUUID()}@test.com` }),
    );
    users.push(user);
    return user;
  };

  const createTestEstablishment = async (
    joinCode?: string | null,
  ): Promise<Establishment> => {
    const owner = await createTestUser();
    const company = await em.save(em.create(Company, { ownerId: owner.id }));
    return em.save(
      em.create(Establishment, {
        companyId: company.id,
        name: 'Campo Test',
        provincia: 'Córdoba',
        joinCode,
      }),
    );
  };

  // 6 uppercase alphanumeric chars, unique per run.
  const randomCode = (): string =>
    randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();

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
        join(__dirname, '..', 'database', 'migrations', '*.ts'),
      ],
      migrationsRun: true,
      synchronize: false,
      logging: false,
    });
    await dataSource.initialize();
    em = dataSource.manager;
  });

  afterAll(async () => {
    // Cascades to companies, establishments and user_farm.
    if (users.length) await em.remove(users);
    await dataSource?.destroy();
  });

  describe('UserFarm', () => {
    it('creates user-farm association with role', async () => {
      const user = await createTestUser();
      const est = await createTestEstablishment();
      const uf = await em.save(UserFarm, {
        userId: user.id,
        farmId: est.id,
        role: 'admin',
        active: true,
      });
      expect(uf.role).toBe('admin');

      const loaded = await em.findOne(UserFarm, {
        where: { userId: user.id, farmId: est.id },
        relations: { farm: true },
      });
      expect(loaded?.farm).toBeInstanceOf(Establishment);
      expect(loaded?.farm.id).toBe(est.id);
    });

    it('marks only one farm active per user', async () => {
      const user = await createTestUser();
      const est1 = await createTestEstablishment();
      const est2 = await createTestEstablishment();
      await em.save(UserFarm, {
        userId: user.id,
        farmId: est1.id,
        role: 'admin',
        active: true,
      });
      await em.save(UserFarm, {
        userId: user.id,
        farmId: est2.id,
        role: 'tecnico',
        active: false,
      });
      const active = await em.find(UserFarm, {
        where: { userId: user.id, active: true },
      });
      expect(active).toHaveLength(1);
      expect(active[0].farmId).toBe(est1.id);
    });

    it('cascades delete when the establishment is deleted', async () => {
      const user = await createTestUser();
      const est = await createTestEstablishment();
      await em.save(UserFarm, { userId: user.id, farmId: est.id, role: 'admin' });
      await em.delete(Establishment, est.id);
      const found = await em.findOne(UserFarm, {
        where: { userId: user.id, farmId: est.id },
      });
      expect(found).toBeNull();
    });
  });

  describe('establishments.join_code', () => {
    it('is a nullable varchar(6)', async () => {
      const rows = await dataSource.query(
        `SELECT data_type, character_maximum_length, is_nullable
         FROM information_schema.columns
         WHERE table_name = 'establishments' AND column_name = 'join_code'`,
      );
      expect(rows).toEqual([
        {
          data_type: 'character varying',
          character_maximum_length: 6,
          is_nullable: 'YES',
        },
      ]);
    });

    it('has a unique index on join_code', async () => {
      const [index] = await dataSource.query(
        `SELECT indexdef FROM pg_indexes
         WHERE schemaname = 'public' AND indexname = 'uk_establishments_join_code'`,
      );
      expect(index?.indexdef).toMatch(
        /CREATE UNIQUE INDEX .* ON public\.establishments .*\(join_code\)/,
      );
    });

    it('stores and reads back a join code', async () => {
      const code = randomCode();
      const est = await createTestEstablishment(code);
      const loaded = await em.findOneBy(Establishment, { id: est.id });
      expect(loaded?.joinCode).toBe(code);
    });

    it('allows many establishments without a join code', async () => {
      const a = await createTestEstablishment(null);
      const b = await createTestEstablishment(null);
      const loaded = await em.findBy(Establishment, [{ id: a.id }, { id: b.id }]);
      expect(loaded.map((e) => e.joinCode)).toEqual([null, null]);
    });

    it('rejects a duplicate join code', async () => {
      const code = randomCode();
      await createTestEstablishment(code);
      await expect(createTestEstablishment(code)).rejects.toMatchObject({
        driverError: {
          code: UNIQUE_VIOLATION,
          constraint: 'uk_establishments_join_code',
        },
      });
    });

    it('rejects a join code longer than 6 characters', async () => {
      await expect(createTestEstablishment('ABCDEFG')).rejects.toMatchObject({
        driverError: { code: '22001' }, // string_data_right_truncation
      });
    });
  });
});
