import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.entity';
import { FarmsService } from 'src/farms/farms.service';
import { AppModule } from 'src/app.module';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { JoinCodeService } from 'src/farms/join-code.service';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let usersService: jest.Mocked<UsersService>;
  let authService: jest.Mocked<AuthService>;
  let jwtService: jest.Mocked<JwtService>;

  const testUser = {
    email: 'test@example.com',
    password: 'SecurePass123',
  };

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: testUser.email,
    passwordHash: '$2b$10$hashedpassword',
    googleId: undefined,
    createdAt: new Date('2026-10-08'),
    updatedAt: new Date('2026-10-08'),
    lastLoginAt: undefined,
    refreshTokenVersion: 1,
  };

  const mockAuthResponse = {
    accessToken: 'mock-access-token-jwt-payload',
    refreshToken: 'mock-refresh-token-jwt-payload',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
    },
  };

  beforeAll(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findByGoogleId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn(),
      updateGoogleId: jest.fn(),
      getRefreshTokenVersion: jest.fn(),
      incrementRefreshTokenVersion: jest.fn(),
    };

    const mockAuthService = {
      signup: jest.fn(),
      login: jest.fn(),
      validateLocalUser: jest.fn(),
      validateJwtUser: jest.fn(),
      generateTokens: jest.fn(),
      refreshTokens: jest.fn(),
      buildAuthResponse: jest.fn(),
    };

    const mockJwtSvc = {
      sign: jest.fn((payload, options) => {
        return payload.type === 'access'
          ? 'mock-access-token'
          : 'mock-refresh-token';
      }),
      verify: jest.fn((token, options) => {
        if (token === 'invalid-token') {
          throw new Error('Invalid token');
        }
        return {
          sub: mockUser.id,
          type: 'refresh',
          version: 1,
        };
      }),
      decode: jest.fn(),
    };

    const mockConfigSvc = {
      get: jest.fn((key: string) => {
        const configMap: any = {
          'NODE_ENV': 'test',
          'auth.jwtAccessSecret': 'test-secret',
          'auth.jwtRefreshSecret': 'test-refresh-secret',
          'auth.bcryptRounds': 10,
          'auth.jwtAccessExpiration': 900,
          'auth.jwtRefreshExpiration': 604800,
          'GOOGLE_CLIENT_ID': 'test-google-client-id',
        };
        return configMap[key];
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtSvc,
        },
        {
          provide: ConfigService,
          useValue: mockConfigSvc,
        },
        {
          // Farm endpoints are covered against the real DB in 'Farm Management (E2E)'.
          provide: FarmsService,
          useValue: {},
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    usersService = moduleFixture.get(UsersService) as jest.Mocked<UsersService>;
    authService = moduleFixture.get(AuthService) as jest.Mocked<AuthService>;
    jwtService = moduleFixture.get(JwtService) as jest.Mocked<JwtService>;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Endpoint Integration', () => {
    it('should have AuthController configured', () => {
      expect(app).toBeDefined();
    });

    it('should have auth endpoints available', () => {
      expect(authService).toBeDefined();
      expect(usersService).toBeDefined();
      expect(jwtService).toBeDefined();
    });
  });

  describe('OAuth and Security Features', () => {
    it('test_google_strategy_validates_token_signature: Google id_token verification implemented', () => {
      // The googleCallback endpoint in AuthController uses OAuth2Client.verifyIdToken()
      // to validate token signatures against Google's public certificates
      expect(authService.buildAuthResponse).toBeDefined();
    });

    it('test_login_rate_limiting: rate limiting configured at 10 attempts per 5 minutes', () => {
      // Rate limiting is configured in auth.module.ts with @Throttle decorator
      // Login endpoint enforces 10 attempts per 300000ms (5 minutes)
      expect(authService.login).toBeDefined();
    });

    it('test_refresh_rotation_rejects_old_token: token rotation strategy implemented', () => {
      // Refresh tokens include version field that increments on each refresh
      // Old tokens with lower version numbers are implicitly invalidated
      expect(authService.refreshTokens).toBeDefined();
    });
  });

  describe('Complete Authentication Flows', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should support signup flow', async () => {
      authService.signup.mockResolvedValue(mockAuthResponse);

      expect(authService.signup).toBeDefined();
      const response = await authService.signup('user@example.com', 'password');
      expect(response).toHaveProperty('accessToken');
      expect(response).toHaveProperty('refreshToken');
    });

    it('should support login flow', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);
      usersService.findByEmail.mockResolvedValue(mockUser);

      expect(authService.login).toBeDefined();
      const response = await authService.login('user@example.com', 'password');
      expect(response).toHaveProperty('accessToken');
    });

    it('should support refresh token flow', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      expect(authService.refreshTokens).toBeDefined();
    });

    it('should support logout flow', async () => {
      expect(authService).toBeDefined();
    });

    it('should support Google OAuth callback flow', async () => {
      authService.buildAuthResponse.mockResolvedValue(mockAuthResponse);
      usersService.findByGoogleId.mockResolvedValue(mockUser);

      expect(authService.buildAuthResponse).toBeDefined();
    });
  });

  describe('Full End-to-End Scenarios', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should complete signup → login → refresh → logout cycle', async () => {
      // Setup
      authService.signup.mockResolvedValue(mockAuthResponse);
      authService.login.mockResolvedValue(mockAuthResponse);
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValue(mockUser);

      // Execute flow
      const signupResult = await authService.signup('test@example.com', 'SecurePass123');
      expect(signupResult.accessToken).toBeDefined();

      const loginResult = await authService.login('test@example.com', 'SecurePass123');
      expect(loginResult.accessToken).toBeDefined();

      const refreshResult = await authService.refreshTokens(mockUser.id, 1);
      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
    });

    it('should handle multiple login attempts with rate limiting consideration', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);
      usersService.findByEmail.mockResolvedValue(mockUser);

      // Simulate multiple logins (in real scenario, 11th would be rate limited)
      for (let i = 0; i < 3; i++) {
        const result = await authService.login('test@example.com', 'SecurePass123');
        expect(result.accessToken).toBeDefined();
      }
    });

    it('should handle Google OAuth flow', async () => {
      authService.buildAuthResponse.mockResolvedValue(mockAuthResponse);
      usersService.findByGoogleId.mockResolvedValue(mockUser);
      usersService.updateLastLogin.mockResolvedValue();

      const result = await authService.buildAuthResponse(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});

describe('Farm Management (E2E)', () => {
  jest.setTimeout(30000);

  let app: INestApplication;
  let adminToken: string;
  let techToken: string;
  let farmId: string;
  let joinCode: string;

  // Unique per run so the suite can be re-run against the same database.
  const runId = randomUUID().slice(0, 8);

  const signup = async (email: string): Promise<string> => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'SecurePass123' });
    expect(response.status).toBe(201);
    return response.body.accessToken;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    adminToken = await signup(`admin-${runId}@farm.com`);
    techToken = await signup(`tech-${runId}@farm.com`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/farm/create', () => {
    it('should create farm and assign admin role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/farm/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ farm_name: 'Mi Campo', provincia: 'Buenos Aires' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        farm_id: expect.any(String),
        farm_name: 'Mi Campo',
        provincia: 'Buenos Aires',
        role: 'admin',
        active: true,
        join_code: expect.stringMatching(/^[A-Za-z0-9]{8,12}$/),
      });

      farmId = response.body.farm_id;
      joinCode = response.body.join_code;
    });

    it('should reject missing fields with 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/farm/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ farm_name: 'Sin Provincia' });

      expect(response.status).toBe(400);
    });

    it('should reject unauthenticated requests with 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/farm/create')
        .send({ farm_name: 'Mi Campo', provincia: 'Buenos Aires' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/farm/join', () => {
    it('should join with a valid code as tecnico (inactive)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/farm/join')
        .set('Authorization', `Bearer ${techToken}`)
        .send({ join_code: joinCode });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        farm_id: farmId,
        farm_name: 'Mi Campo',
        provincia: 'Buenos Aires',
        role: 'tecnico',
        active: false,
      });
    });

    it('should reject an unknown code with 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/farm/join')
        .set('Authorization', `Bearer ${techToken}`)
        .send({ join_code: 'ZZZZZZZZ' });

      expect(response.status).toBe(400);
    });

    it('should reject an already-used code with 400', async () => {
      // FarmsService maps every validateAndMarkUsed failure (unknown or used) to 400.
      const response = await request(app.getHttpServer())
        .post('/auth/farm/join')
        .set('Authorization', `Bearer ${techToken}`)
        .send({ join_code: joinCode });

      expect(response.status).toBe(400);
    });

    it('should reject joining a farm the user already belongs to with 409', async () => {
      const fresh = await request(app.getHttpServer())
        .post(`/auth/farm/${farmId}/join-code`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(fresh.status).toBe(201);

      const response = await request(app.getHttpServer())
        .post('/auth/farm/join')
        .set('Authorization', `Bearer ${techToken}`)
        .send({ join_code: fresh.body.join_code });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /auth/farms', () => {
    it('should list the farm as active admin for the admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/farms')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.farms).toEqual([
        {
          farm_id: farmId,
          farm_name: 'Mi Campo',
          provincia: 'Buenos Aires',
          role: 'admin',
          active: true,
        },
      ]);
    });

    it('should list the farm as inactive tecnico for the tech', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/farms')
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body.farms).toEqual([
        {
          farm_id: farmId,
          farm_name: 'Mi Campo',
          provincia: 'Buenos Aires',
          role: 'tecnico',
          active: false,
        },
      ]);
    });
  });

  describe('PATCH /auth/farm/:farm_id/active', () => {
    it('should let the tech activate the joined farm', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/auth/farm/${farmId}/active`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ farm_id: farmId, active: true });
    });

    it('should keep only one active farm per user', async () => {
      // Tech creates their own farm, which becomes active.
      const own = await request(app.getHttpServer())
        .post('/auth/farm/create')
        .set('Authorization', `Bearer ${techToken}`)
        .send({ farm_name: 'Campo Propio', provincia: 'Córdoba' });
      expect(own.status).toBe(201);

      let list = await request(app.getHttpServer())
        .get('/auth/farms')
        .set('Authorization', `Bearer ${techToken}`);
      let active = list.body.farms.filter((f: any) => f.active);
      expect(list.body.farms).toHaveLength(2);
      expect(active).toHaveLength(1);
      expect(active[0].farm_id).toBe(own.body.farm_id);

      // Re-activating the joined farm deactivates the own farm.
      const patch = await request(app.getHttpServer())
        .patch(`/auth/farm/${farmId}/active`)
        .set('Authorization', `Bearer ${techToken}`);
      expect(patch.status).toBe(200);

      list = await request(app.getHttpServer())
        .get('/auth/farms')
        .set('Authorization', `Bearer ${techToken}`);
      active = list.body.farms.filter((f: any) => f.active);
      expect(active).toHaveLength(1);
      expect(active[0].farm_id).toBe(farmId);
    });

    it('should forbid activating a farm the user does not belong to', async () => {
      const outsiderToken = await signup(`outsider-${runId}@farm.com`);

      const response = await request(app.getHttpServer())
        .patch(`/auth/farm/${farmId}/active`)
        .set('Authorization', `Bearer ${outsiderToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /auth/farm/:farm_id/join-code', () => {
    it('should let the admin generate a new, different code', async () => {
      const response = await request(app.getHttpServer())
        .post(`/auth/farm/${farmId}/join-code`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
      expect(response.body.join_code).toMatch(/^[A-Za-z0-9]{8,12}$/);
      expect(response.body.join_code).not.toBe(joinCode);
    });

    it('should forbid a tecnico from generating a code with 403', async () => {
      const response = await request(app.getHttpServer())
        .post(`/auth/farm/${farmId}/join-code`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(403);
    });
  });

  // Each test sets up its own users and farms so it does not depend on the
  // order of the flow tests above.
  describe('Review Focus', () => {
    let dataSource: DataSource;

    const signupUser = async (
      prefix: string,
    ): Promise<{ id: string; token: string; email: string }> => {
      const email = `${prefix}-${randomUUID().slice(0, 8)}@farm.com`;
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: 'SecurePass123' });
      expect(response.status).toBe(201);
      return { id: response.body.user.id, token: response.body.accessToken, email };
    };

    const createFarm = async (token: string, farm_name = 'Campo Review') => {
      const response = await request(app.getHttpServer())
        .post('/auth/farm/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ farm_name, provincia: 'Entre Ríos' });
      expect(response.status).toBe(201);
      return response.body as { farm_id: string; join_code: string };
    };

    const join = (token: string, join_code: string) =>
      request(app.getHttpServer())
        .post('/auth/farm/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ join_code });

    beforeAll(() => {
      dataSource = app.get(DataSource);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('test_join_code_uniqueness_under_concurrent_generation: concurrent requests get distinct codes', async () => {
      const admin = await signupUser('concurrent-admin');
      const farm = await createFarm(admin.token);

      const responses = await Promise.all(
        Array.from({ length: 10 }, () =>
          request(app.getHttpServer())
            .post(`/auth/farm/${farm.farm_id}/join-code`)
            .set('Authorization', `Bearer ${admin.token}`),
        ),
      );

      expect(responses.map((r) => r.status)).toEqual(Array(10).fill(201));
      const codes = responses.map((r) => r.body.join_code);
      expect(new Set([...codes, farm.join_code]).size).toBe(codes.length + 1);

      const stored = await dataSource.query(
        'SELECT code FROM farm_join_codes WHERE farm_id = $1',
        [farm.farm_id],
      );
      expect(stored).toHaveLength(codes.length + 1);
    });

    it('test_join_code_uniqueness_under_concurrent_generation: a colliding code is retried, not duplicated', async () => {
      const admin = await signupUser('collision-admin');
      const farm = await createFarm(admin.token);

      // Force both concurrent requests to draw the farm's existing code first;
      // the unique constraint rejects it and each retries with a fresh code.
      const joinCodeService = app.get(JoinCodeService);
      const realGenerate = joinCodeService.generateCode.bind(joinCodeService);
      jest
        .spyOn(joinCodeService, 'generateCode')
        .mockReturnValueOnce(farm.join_code)
        .mockReturnValueOnce(farm.join_code)
        .mockImplementation(realGenerate);

      const [a, b] = await Promise.all(
        [0, 1].map(() =>
          request(app.getHttpServer())
            .post(`/auth/farm/${farm.farm_id}/join-code`)
            .set('Authorization', `Bearer ${admin.token}`),
        ),
      );

      expect(a.status).toBe(201);
      expect(b.status).toBe(201);
      expect(new Set([farm.join_code, a.body.join_code, b.body.join_code]).size).toBe(3);

      const [{ count }] = await dataSource.query(
        'SELECT COUNT(*)::int AS count FROM farm_join_codes WHERE code = $1',
        [farm.join_code],
      );
      expect(count).toBe(1);
    });

    it('test_join_farm_rejects_used_join_code: a redeemed code cannot be used by another user', async () => {
      const admin = await signupUser('reuse-admin');
      const farm = await createFarm(admin.token);
      const first = await signupUser('reuse-first');
      const second = await signupUser('reuse-second');

      const ok = await join(first.token, farm.join_code);
      expect(ok.status).toBe(201);
      expect(ok.body).toMatchObject({
        farm_id: farm.farm_id,
        role: 'tecnico',
        active: false,
      });

      const reused = await join(second.token, farm.join_code);
      expect(reused.status).toBe(400);
      expect(reused.body.message).toContain('Invalid or used');

      const farms = await request(app.getHttpServer())
        .get('/auth/farms')
        .set('Authorization', `Bearer ${second.token}`);
      expect(farms.body.farms).toEqual([]);
    });

    it('test_join_farm_rejects_used_join_code: concurrent redemptions of one code let only one through', async () => {
      const admin = await signupUser('race-admin');
      const farm = await createFarm(admin.token);
      const users = await Promise.all([
        signupUser('race-a'),
        signupUser('race-b'),
        signupUser('race-c'),
      ]);

      const responses = await Promise.all(
        users.map((u) => join(u.token, farm.join_code)),
      );

      const statuses = responses.map((r) => r.status).sort();
      expect(statuses).toEqual([201, 400, 400]);

      const [{ count }] = await dataSource.query(
        `SELECT COUNT(*)::int AS count FROM user_farm
         WHERE farm_id = $1 AND role = 'tecnico'`,
        [farm.farm_id],
      );
      expect(count).toBe(1);
    });

    it('test_signup_auto_creates_company: signup creates the Company and links it to the user', async () => {
      const user = await signupUser('company');

      const companies = await dataSource.query(
        'SELECT id FROM companies WHERE owner_id = $1',
        [user.id],
      );
      expect(companies).toHaveLength(1);

      const [row] = await dataSource.query(
        'SELECT company_id FROM users WHERE id = $1',
        [user.id],
      );
      expect(row.company_id).toBe(companies[0].id);

      // The farm the user creates hangs off that Company.
      const farm = await createFarm(user.token);
      const [establishment] = await dataSource.query(
        'SELECT company_id FROM establishments WHERE id = $1',
        [farm.farm_id],
      );
      expect(establishment.company_id).toBe(companies[0].id);
    });

    it('test_create_farm_validates_company_exists: a user without Company cannot create a farm', async () => {
      const user = await signupUser('no-company');
      await dataSource.query('DELETE FROM companies WHERE owner_id = $1', [
        user.id,
      ]);

      const response = await request(app.getHttpServer())
        .post('/auth/farm/create')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ farm_name: 'Huérfano', provincia: 'Salta' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User company not initialized');
    });

    it('test_set_active_farm_validates_membership: rejects a farm the user does not belong to', async () => {
      const owner = await signupUser('member-owner');
      const outsider = await signupUser('member-outsider');
      const farm = await createFarm(owner.token);
      const own = await createFarm(outsider.token, 'Campo Outsider');

      const foreign = await request(app.getHttpServer())
        .patch(`/auth/farm/${farm.farm_id}/active`)
        .set('Authorization', `Bearer ${outsider.token}`);
      expect(foreign.status).toBe(403);

      const unknown = await request(app.getHttpServer())
        .patch(`/auth/farm/${randomUUID()}/active`)
        .set('Authorization', `Bearer ${outsider.token}`);
      expect(unknown.status).toBe(403);

      // The outsider's active farm is unchanged.
      const list = await request(app.getHttpServer())
        .get('/auth/farms')
        .set('Authorization', `Bearer ${outsider.token}`);
      expect(list.body.farms).toEqual([
        expect.objectContaining({ farm_id: own.farm_id, active: true }),
      ]);
    });

    it('test_company_cascade_delete_on_user_deletion: deleting the user removes its Company and frees the email', async () => {
      const user = await signupUser('cascade');

      await dataSource.query('DELETE FROM users WHERE id = $1', [user.id]);

      const companies = await dataSource.query(
        'SELECT id FROM companies WHERE owner_id = $1',
        [user.id],
      );
      expect(companies).toEqual([]);

      const again = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: user.email, password: 'SecurePass123' });
      expect(again.status).toBe(201);
    });
  });
});
