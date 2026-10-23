import { join } from 'path';
import { randomUUID } from 'crypto';
import { ForbiddenException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Company } from 'src/companies/companies.entity';
import { CompanyService } from 'src/companies/companies.service';
import { Establishment } from 'src/establishments/establishments.entity';
import { EstablishmentsRepository } from 'src/establishments/establishments.repository';
import { FarmJoinCodeRepository } from 'src/farms/farm-join-code.repository';
import { FarmsService } from 'src/farms/farms.service';
import { JoinCodeService } from 'src/farms/join-code.service';
import { UserFarm } from 'src/farms/user-farm.entity';
import { UserFarmRepository } from 'src/farms/user-farm.repository';
import { User } from 'src/users/users.entity';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';

// users.active_farm_id and the multi-farm listing/switching flow, against the
// real database (same standalone DataSource as the other integration specs).
describe('Active farm (users.active_farm_id)', () => {
  jest.setTimeout(30000);

  let dataSource: DataSource;
  let em: EntityManager;
  let userFarmRepo: UserFarmRepository;
  let usersService: UsersService;
  let farmsService: FarmsService;
  let company: Company;
  const users: User[] = [];

  const createTestUser = async (): Promise<User> => {
    const user = await em.save(
      em.create(User, { email: `active-farm-${randomUUID()}@test.com` }),
    );
    users.push(user);
    return user;
  };

  const createTestEstablishment = async (
    owner: Company,
  ): Promise<Establishment> =>
    em.save(
      em.create(Establishment, {
        companyId: owner.id,
        name: `Campo ${randomUUID().slice(0, 6)}`,
        provincia: 'Córdoba',
      }),
    );

  const activeRows = async (userId: string): Promise<string[]> =>
    (await em.find(UserFarm, { where: { userId, active: true } })).map(
      (uf) => uf.farmId,
    );

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

    userFarmRepo = new UserFarmRepository(dataSource);
    usersService = new UsersService(new UsersRepository(dataSource));
    farmsService = new FarmsService(
      new EstablishmentsRepository(dataSource),
      new CompanyService(em),
      userFarmRepo,
      new JoinCodeService(new FarmJoinCodeRepository(dataSource)),
      dataSource,
      usersService,
    );

    const owner = await createTestUser();
    company = await em.save(em.create(Company, { ownerId: owner.id }));
  });

  afterAll(async () => {
    // Cascades to companies, establishments and user_farm.
    if (users.length) await em.remove(users);
    await dataSource?.destroy();
  });

  describe('schema', () => {
    it('adds a nullable uuid active_farm_id', async () => {
      const rows = await dataSource.query(
        `SELECT data_type, is_nullable FROM information_schema.columns
         WHERE table_name = 'users' AND column_name = 'active_farm_id'`,
      );
      expect(rows).toEqual([{ data_type: 'uuid', is_nullable: 'YES' }]);
    });

    it('references establishments with ON DELETE SET NULL', async () => {
      const [fk] = await dataSource.query(
        `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
         WHERE conname = 'fk_users_active_farm_id'`,
      );
      expect(fk?.def).toMatch(
        /FOREIGN KEY \(active_farm_id\) REFERENCES establishments\(id\) ON DELETE SET NULL/,
      );
    });

    it('clears active_farm_id when the establishment is deleted', async () => {
      const user = await createTestUser();
      const est = await createTestEstablishment(company);
      await userFarmRepo.createUserFarm(user.id, est.id, 'admin');
      await userFarmRepo.setActiveFarm(user.id, est.id);

      await em.delete(Establishment, est.id);

      const reloaded = await usersService.findById(user.id);
      expect(reloaded).not.toBeNull();
      expect(reloaded?.activeFarmId).toBeNull();
    });
  });

  describe('multi-farm', () => {
    it('lists all user farms with active status', async () => {
      const user = await createTestUser();
      const est1 = await createTestEstablishment(company);
      const est2 = await createTestEstablishment(company);

      await userFarmRepo.createUserFarm(user.id, est1.id, 'admin');
      await userFarmRepo.createUserFarm(user.id, est2.id, 'tecnico');
      await userFarmRepo.setActiveFarm(user.id, est1.id);

      const farms = await farmsService.listFarmsByUserId(user.id);

      expect(farms).toHaveLength(2);
      expect(farms.find((f) => f.farm_id === est1.id)).toMatchObject({
        role: 'admin',
        active: true,
      });
      expect(farms.find((f) => f.farm_id === est2.id)).toMatchObject({
        role: 'tecnico',
        active: false,
      });
    });

    it('switches active farm for user', async () => {
      const user = await createTestUser();
      const est1 = await createTestEstablishment(company);
      const est2 = await createTestEstablishment(company);

      await userFarmRepo.createUserFarm(user.id, est1.id, 'admin');
      await userFarmRepo.createUserFarm(user.id, est2.id, 'tecnico');
      await userFarmRepo.setActiveFarm(user.id, est1.id);

      const result = await farmsService.setActiveFarm(est2.id, user.id);

      expect(result).toEqual({ farm_id: est2.id, active: true });
      const updated = await usersService.findById(user.id);
      expect(updated?.activeFarmId).toBe(est2.id);
      // user_farm.active stays in sync: exactly one row, the new farm.
      expect(await activeRows(user.id)).toEqual([est2.id]);
      const farms = await farmsService.listFarmsByUserId(user.id);
      expect(farms.filter((f) => f.active).map((f) => f.farm_id)).toEqual([
        est2.id,
      ]);
    });

    it('test_set_active_farm_validates_membership', async () => {
      const user = await createTestUser();
      const mine = await createTestEstablishment(company);
      const notMine = await createTestEstablishment(company);
      await userFarmRepo.createUserFarm(user.id, mine.id, 'admin');
      await userFarmRepo.setActiveFarm(user.id, mine.id);

      await expect(
        farmsService.setActiveFarm(notMine.id, user.id),
      ).rejects.toThrow(ForbiddenException);

      const reloaded = await usersService.findById(user.id);
      expect(reloaded?.activeFarmId).toBe(mine.id);
      expect(await activeRows(user.id)).toEqual([mine.id]);
    });

    it('rolls back the repository switch for a non-member farm', async () => {
      const user = await createTestUser();
      const mine = await createTestEstablishment(company);
      const notMine = await createTestEstablishment(company);
      await userFarmRepo.createUserFarm(user.id, mine.id, 'admin');
      await userFarmRepo.setActiveFarm(user.id, mine.id);

      await expect(
        userFarmRepo.setActiveFarm(user.id, notMine.id),
      ).rejects.toThrow(/not a member/);

      // The deactivate-all step was rolled back with it.
      const reloaded = await usersService.findById(user.id);
      expect(reloaded?.activeFarmId).toBe(mine.id);
      expect(await activeRows(user.id)).toEqual([mine.id]);
    });

    it("does not touch other users' active farm", async () => {
      const alice = await createTestUser();
      const bob = await createTestUser();
      const est1 = await createTestEstablishment(company);
      const est2 = await createTestEstablishment(company);
      for (const u of [alice, bob]) {
        await userFarmRepo.createUserFarm(u.id, est1.id, 'tecnico');
        await userFarmRepo.createUserFarm(u.id, est2.id, 'tecnico');
      }
      await userFarmRepo.setActiveFarm(bob.id, est1.id);

      await farmsService.setActiveFarm(est2.id, alice.id);

      expect((await usersService.findById(bob.id))?.activeFarmId).toBe(
        est1.id,
      );
      expect(await activeRows(bob.id)).toEqual([est1.id]);
    });
  });
});
