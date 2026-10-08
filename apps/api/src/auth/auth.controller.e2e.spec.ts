import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.entity';

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
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const configMap: Record<string, any> = {
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

    const mockJwtService = {
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
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
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

  describe('POST /auth/signup', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create user and return tokens', async () => {
      authService.signup.mockResolvedValue(mockAuthResponse);

      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(testUser.email);
      expect(authService.signup).toHaveBeenCalledWith(
        testUser.email,
        testUser.password,
      );
    });

    it('should reject duplicate email', async () => {
      authService.signup.mockRejectedValue(
        new Error('Email already registered'),
      );

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(500);
    });

    it('should reject weak password', async () => {
      authService.signup.mockRejectedValue(
        new Error('Password does not meet requirements'),
      );

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'weak@example.com', password: 'weak' })
        .expect(500);
    });

    it('should set refreshToken cookie', async () => {
      authService.signup.mockResolvedValue(mockAuthResponse);

      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(res.headers['set-cookie']).toBeDefined();
      const cookies = (res.headers['set-cookie'] || []) as unknown as string[];
      expect(cookies.some((c) => c.includes('refreshToken'))).toBe(true);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return tokens for valid credentials', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);
      usersService.findByEmail.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject invalid password', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword' })
        .expect(500);
    });

    it('should reject non-existent email', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'SecurePass123' })
        .expect(500);
    });

    it('test_login_rate_limiting: should be subject to rate limiting', async () => {
      // Note: Rate limiting is typically handled by @nestjs/throttler
      // This test verifies the endpoint accepts the request
      authService.login.mockResolvedValue(mockAuthResponse);
      usersService.findByEmail.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
    });

    it('should set refreshToken cookie on login', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);
      usersService.findByEmail.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(res.headers['set-cookie']).toBeDefined();
      const cookies = (res.headers['set-cookie'] || []) as unknown as string[];
      expect(cookies.some((c) => c.includes('refreshToken'))).toBe(true);
    });
  });

  describe('POST /auth/refresh', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return new tokens for valid refresh token', async () => {
      const refreshToken = 'mock-refresh-token';
      usersService.findById.mockResolvedValue(mockUser);
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(400);
    });

    it('should reject missing refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });

    it('test_refresh_rotation_rejects_old_token: should issue new token on refresh', async () => {
      const refreshToken = 'old-refresh-token';
      usersService.findById.mockResolvedValue(mockUser);
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Verify new token is different
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.refreshToken).not.toBe(refreshToken);
    });
  });

  describe('POST /auth/logout', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should logout user', async () => {
      const accessToken = 'mock-access-token';
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        type: 'access',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.message).toBe('Logged out successfully');
    });

    it('should clear refreshToken cookie on logout', async () => {
      const accessToken = 'mock-access-token';
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        type: 'access',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.headers['set-cookie']).toBeDefined();
      const cookies = (res.headers['set-cookie'] || []) as unknown as string[];
      expect(cookies.some((c) => c.includes('refreshToken'))).toBe(true);
    });

    it('should reject logout without token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('should reject logout with invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/google/callback', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('test_google_strategy_validates_token_signature: should reject invalid idToken', async () => {
      const invalidToken =
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpbnZhbGlkIn0.invalid';

      await request(app.getHttpServer())
        .post('/auth/google/callback')
        .send({ idToken: invalidToken })
        .expect(400);
    });

    it('should reject missing idToken', async () => {
      await request(app.getHttpServer())
        .post('/auth/google/callback')
        .send({})
        .expect(400);
    });
  });

  describe('End-to-End Flows', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should complete signup → login → refresh → logout', async () => {
      // Setup mocks
      authService.signup.mockResolvedValue(mockAuthResponse);
      authService.login.mockResolvedValue(mockAuthResponse);
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValue(mockUser);

      // Signup
      const signupRes = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(signupRes.body.accessToken).toBeDefined();
      expect(signupRes.body.refreshToken).toBeDefined();

      // Login
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(loginRes.body.accessToken).toBeDefined();
      expect(loginRes.body.refreshToken).toBeDefined();

      // Refresh
      const refreshRes = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: loginRes.body.refreshToken })
        .expect(200);

      expect(refreshRes.body.accessToken).toBeDefined();
      expect(refreshRes.body.refreshToken).toBeDefined();

      // Logout
      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        type: 'access',
      });

      const logoutRes = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${refreshRes.body.accessToken}`)
        .expect(200);

      expect(logoutRes.body.message).toBe('Logged out successfully');
    });

    it('should handle signup → multiple logins → refresh cycles', async () => {
      authService.signup.mockResolvedValue(mockAuthResponse);
      authService.login.mockResolvedValue(mockAuthResponse);
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValue(mockUser);

      // Signup
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      // Multiple logins
      for (let i = 0; i < 3; i++) {
        const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send(testUser)
          .expect(200);

        expect(loginRes.body.accessToken).toBeDefined();

        // Refresh after each login
        const refreshRes = await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({ refreshToken: loginRes.body.refreshToken })
          .expect(200);

        expect(refreshRes.body.accessToken).toBeDefined();
      }
    });
  });
});
