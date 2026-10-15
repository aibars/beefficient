import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';

// Postgres SQLSTATE codes.
const UNIQUE_VIOLATION = '23505';
const CHECK_VIOLATION = '23514';
const FK_VIOLATION = '23503';

describe('Database Migrations (Integration)', () => {
  jest.setTimeout(30000);

  let app: INestApplication;
  let dataSource: DataSource;
  let userId: string;
  let farmId: string;

  const expectViolation = async (
    sql: string,
    params: unknown[],
    code: string,
    constraint?: string,
  ) => {
    let error: any;
    try {
      await dataSource.query(sql, params);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.code ?? error.driverError?.code).toBe(code);
    if (constraint) {
      expect(error.constraint ?? error.driverError?.constraint).toBe(
        constraint,
      );
    }
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);

    const runId = randomUUID().slice(0, 8);
    [{ id: userId }] = await dataSource.query(
      `INSERT INTO users (email) VALUES ($1) RETURNING id`,
      [`migrations-${runId}@test.com`],
    );
    [{ id: farmId }] = await dataSource.query(
      `INSERT INTO farms (name, provincia, owner_id) VALUES ($1, $2, $3) RETURNING id`,
      ['Campo Migraciones', 'Santa Fe', userId],
    );
  });

  afterAll(async () => {
    // Cascades to farms, user_farm, farm_join_codes, user_device_tokens.
    if (userId) {
      await dataSource.query(`DELETE FROM users WHERE id = $1`, [userId]);
    }
    await app.close();
  });

  describe('Schema Creation', () => {
    it('should have no pending migrations', async () => {
      await expect(dataSource.showMigrations()).resolves.toBe(false);
    });

    it.each(['farms', 'user_farm', 'farm_join_codes', 'user_device_tokens'])(
      'should create table %s',
      async (table) => {
        const rows = await dataSource.query(
          `SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = $1`,
          [table],
        );
        expect(rows).toHaveLength(1);
      },
    );

    it('should add refresh_token_version to users', async () => {
      const rows = await dataSource.query(
        `SELECT column_default, is_nullable FROM information_schema.columns
         WHERE table_name = 'users' AND column_name = 'refresh_token_version'`,
      );
      expect(rows).toEqual([{ column_default: '1', is_nullable: 'NO' }]);
    });
  });

  describe('Constraints', () => {
    it('should reject duplicate user_farm(user_id, farm_id)', async () => {
      await dataSource.query(
        `INSERT INTO user_farm (user_id, farm_id, role) VALUES ($1, $2, 'admin')`,
        [userId, farmId],
      );
      await expectViolation(
        `INSERT INTO user_farm (user_id, farm_id, role) VALUES ($1, $2, 'tecnico')`,
        [userId, farmId],
        UNIQUE_VIOLATION,
      );
    });

    it('should reject an invalid user_farm.role', async () => {
      const [{ id: otherFarmId }] = await dataSource.query(
        `INSERT INTO farms (name, provincia, owner_id) VALUES ('Otro', 'Salta', $1) RETURNING id`,
        [userId],
      );
      await expectViolation(
        `INSERT INTO user_farm (user_id, farm_id, role) VALUES ($1, $2, 'owner')`,
        [userId, otherFarmId],
        CHECK_VIOLATION,
        'chk_user_farm_role',
      );
    });

    it('should reject an invalid user_device_tokens.platform', async () => {
      await expectViolation(
        `INSERT INTO user_device_tokens (user_id, device_token, platform) VALUES ($1, 'tok', 'windows')`,
        [userId],
        CHECK_VIOLATION,
        'chk_user_device_tokens_platform',
      );
    });

    it('should reject duplicate user_device_tokens(user_id, device_token)', async () => {
      await dataSource.query(
        `INSERT INTO user_device_tokens (user_id, device_token, platform) VALUES ($1, 'dup-token', 'ios')`,
        [userId],
      );
      await expectViolation(
        `INSERT INTO user_device_tokens (user_id, device_token, platform) VALUES ($1, 'dup-token', 'android')`,
        [userId],
        UNIQUE_VIOLATION,
        'uk_user_device_tokens_user_token',
      );
    });

    it('should reject farm_join_codes with used_by_id but no used_at', async () => {
      await expectViolation(
        `INSERT INTO farm_join_codes (farm_id, code, used_by_id) VALUES ($1, $2, $3)`,
        [farmId, randomUUID().replace(/-/g, '').slice(0, 10), userId],
        CHECK_VIOLATION,
        'chk_farm_join_codes_used_pair',
      );
    });

    it('should reject farm_join_codes with used_at but no used_by_id', async () => {
      await expectViolation(
        `INSERT INTO farm_join_codes (farm_id, code, used_at) VALUES ($1, $2, NOW())`,
        [farmId, randomUUID().replace(/-/g, '').slice(0, 10)],
        CHECK_VIOLATION,
        'chk_farm_join_codes_used_pair',
      );
    });

    it('should reject duplicate farm_join_codes.code', async () => {
      const code = randomUUID().replace(/-/g, '').slice(0, 10);
      await dataSource.query(
        `INSERT INTO farm_join_codes (farm_id, code) VALUES ($1, $2)`,
        [farmId, code],
      );
      await expectViolation(
        `INSERT INTO farm_join_codes (farm_id, code) VALUES ($1, $2)`,
        [farmId, code],
        UNIQUE_VIOLATION,
        'uk_farm_join_codes_code',
      );
    });

    it('should reject a farm whose owner does not exist', async () => {
      await expectViolation(
        `INSERT INTO farms (name, provincia, owner_id) VALUES ('X', 'Y', $1)`,
        [randomUUID()],
        FK_VIOLATION,
        'fk_farms_owner_id',
      );
    });
  });

  describe('Indices', () => {
    const indexDef = async (name: string): Promise<string | undefined> => {
      const rows = await dataSource.query(
        `SELECT indexdef FROM pg_indexes WHERE schemaname = 'public' AND indexname = $1`,
        [name],
      );
      return rows[0]?.indexdef;
    };

    it('should index farms(owner_id)', async () => {
      expect(await indexDef('idx_farms_owner_id')).toMatch(
        /ON public\.farms .*\(owner_id\)/,
      );
    });

    it('should index user_farm(user_id, active)', async () => {
      expect(await indexDef('idx_user_farm_active')).toMatch(
        /ON public\.user_farm .*\(user_id, active\)/,
      );
    });

    it('should index user_device_tokens(user_id)', async () => {
      expect(await indexDef('idx_user_device_tokens_user')).toMatch(
        /ON public\.user_device_tokens .*\(user_id\)/,
      );
    });
  });
});
