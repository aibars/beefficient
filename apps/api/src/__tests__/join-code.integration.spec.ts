import { join } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { Company } from 'src/companies/companies.entity';
import { CompanyService } from 'src/companies/companies.service';
import { Establishment } from 'src/establishments/establishments.entity';
import { EstablishmentsRepository } from 'src/establishments/establishments.repository';
import { FarmJoinCode } from 'src/farms/farm-join-code.entity';
import { FarmJoinCodeRepository } from 'src/farms/farm-join-code.repository';
import { FarmsService } from 'src/farms/farms.service';
import { JoinCodeService } from 'src/farms/join-code.service';
import { UserFarm } from 'src/farms/user-farm.entity';
import { UserFarmRepository } from 'src/farms/user-farm.repository';
import { User } from 'src/users/users.entity';
import { UsersRepository } from 'src/users/users.repository';
import { UsersService } from 'src/users/users.service';

// Same standalone DataSource as the other integration specs. Concurrency is
// only meaningful against the real database, so these complement the mocked
// unit tests in src/farms/join-code.service.spec.ts.
describe('Join codes (farm_join_codes)', () => {
  jest.setTimeout(30000);

  let dataSource: DataSource;
  let em: EntityManager;
  let joinCodeService: JoinCodeService;
  let farmsService: FarmsService;
  const users: User[] = [];
  const farms: Establishment[] = [];

  const createTestUser = async (): Promise<User> => {
    const user = await em.save(
      em.create(User, { email: `join-code-${randomUUID()}@test.com` }),
    );
    users.push(user);
    return user;
  };

  const createTestFarm = async (): Promise<Establishment> => {
    const owner = await createTestUser();
    const company = await em.save(em.create(Company, { ownerId: owner.id }));
    const farm = await em.save(
      em.create(Establishment, {
        companyId: company.id,
        name: 'Campo Test',
        provincia: 'Entre Ríos',
      }),
    );
    farms.push(farm);
    return farm;
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
        join(__dirname, '..', 'database', 'migrations', '*.ts'),
      ],
      migrationsRun: true,
      synchronize: false,
      logging: false,
    });
    await dataSource.initialize();
    em = dataSource.manager;

    joinCodeService = new JoinCodeService(
      new FarmJoinCodeRepository(dataSource),
    );
    farmsService = new FarmsService(
      new EstablishmentsRepository(dataSource),
      new CompanyService(em),
      new UserFarmRepository(dataSource),
      joinCodeService,
      dataSource,
      new UsersService(new UsersRepository(dataSource)),
    );
  });

  afterAll(async () => {
    // Codes go first: deleting a redeemer would SET NULL used_by_id while
    // used_at stays set, which chk_farm_join_codes_used_pair rejects.
    if (farms.length) {
      await em.delete(FarmJoinCode, { farmId: In(farms.map((f) => f.id)) });
    }
    // Cascades to companies, establishments and user_farm.
    if (users.length) await em.remove(users);
    await dataSource?.destroy();
  });

  it('marks the code used with redeemer and timestamp', async () => {
    const farm = await createTestFarm();
    const user = await createTestUser();
    const code = await joinCodeService.generateAndCreate(farm.id);

    await expect(
      joinCodeService.validateAndMarkUsed(code, user.id),
    ).resolves.toEqual({ farmId: farm.id });

    const stored = await em.findOneByOrFail(FarmJoinCode, { code });
    expect(stored.usedById).toBe(user.id);
    expect(stored.usedAt).toBeInstanceOf(Date);
  });

  it('test_join_farm_rejects_used_join_code', async () => {
    const farm = await createTestFarm();
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const code = await joinCodeService.generateAndCreate(farm.id);

    await joinCodeService.validateAndMarkUsed(code, user1.id);
    await expect(
      joinCodeService.validateAndMarkUsed(code, user2.id),
    ).rejects.toThrow('Invalid or used join code');

    // The first redemption is not overwritten.
    const stored = await em.findOneByOrFail(FarmJoinCode, { code });
    expect(stored.usedById).toBe(user1.id);
  });

  it('rejects an unknown code', async () => {
    const user = await createTestUser();
    await expect(
      joinCodeService.validateAndMarkUsed('NOPE00000000', user.id),
    ).rejects.toThrow(BadRequestException);
  });

  it('lets exactly one of several concurrent redemptions win', async () => {
    const farm = await createTestFarm();
    const code = await joinCodeService.generateAndCreate(farm.id);
    const redeemers = await Promise.all(
      Array.from({ length: 5 }, () => createTestUser()),
    );

    const results = await Promise.allSettled(
      redeemers.map((u) => joinCodeService.validateAndMarkUsed(code, u.id)),
    );

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(4);
  });

  it('test_join_code_uniqueness_under_concurrent_generation', async () => {
    const farm = await createTestFarm();

    const codes = await Promise.all(
      Array.from({ length: 5 }, () => joinCodeService.generateAndCreate(farm.id)),
    );

    expect(new Set(codes).size).toBe(5);
    const stored = await em.findBy(FarmJoinCode, { farmId: farm.id });
    expect(stored.map((c) => c.code).sort()).toEqual([...codes].sort());
  });

  describe('FarmsService.joinFarm', () => {
    it('joins as inactive tecnico and burns the code', async () => {
      const farm = await createTestFarm();
      const user = await createTestUser();
      const code = await joinCodeService.generateAndCreate(farm.id);

      const result = await farmsService.joinFarm(code, user.id);

      expect(result).toMatchObject({
        farm_id: farm.id,
        role: 'tecnico',
        active: false,
      });
      await expect(
        em.findOneBy(UserFarm, { userId: user.id, farmId: farm.id }),
      ).resolves.toMatchObject({ role: 'tecnico', active: false });
      await expect(farmsService.joinFarm(code, user.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('does not burn the code when the user is already a member', async () => {
      const farm = await createTestFarm();
      const member = await createTestUser();
      await em.save(UserFarm, {
        userId: member.id,
        farmId: farm.id,
        role: 'tecnico',
      });
      const code = await joinCodeService.generateAndCreate(farm.id);

      await expect(farmsService.joinFarm(code, member.id)).rejects.toThrow(
        ConflictException,
      );

      const stored = await em.findOneByOrFail(FarmJoinCode, { code });
      expect(stored.usedAt).toBeNull();
      const newcomer = await createTestUser();
      await expect(
        farmsService.joinFarm(code, newcomer.id),
      ).resolves.toMatchObject({ farm_id: farm.id });
    });

    it('rolls back the redemption when the membership insert races', async () => {
      const farm = await createTestFarm();
      const user = await createTestUser();
      const [codeA, codeB] = await Promise.all([
        joinCodeService.generateAndCreate(farm.id),
        joinCodeService.generateAndCreate(farm.id),
      ]);

      const results = await Promise.allSettled([
        farmsService.joinFarm(codeA, user.id),
        farmsService.joinFarm(codeB, user.id),
      ]);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      const rejected = results.find(
        (r): r is PromiseRejectedResult => r.status === 'rejected',
      );
      expect(rejected?.reason).toBeInstanceOf(ConflictException);
      // Only the winning code is burned.
      const used = await em.findBy(FarmJoinCode, {
        code: In([codeA, codeB]),
      });
      expect(used.filter((c) => c.usedAt !== null)).toHaveLength(1);
    });
  });
});
