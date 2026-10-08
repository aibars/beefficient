import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.entity';

describe('Passport Strategies', () => {
  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword123456789012345678901234567890',
    googleId: undefined,
    createdAt: new Date('2026-10-08'),
    updatedAt: new Date('2026-10-08'),
    lastLoginAt: undefined,
  };

  const mockGoogleUser: User = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    email: 'google@example.com',
    passwordHash: undefined,
    googleId: 'google_id_123',
    createdAt: new Date('2026-10-08'),
    updatedAt: new Date('2026-10-08'),
    lastLoginAt: new Date('2026-10-08'),
  };

  describe('LocalStrategy', () => {
    let strategy: LocalStrategy;
    let authService: jest.Mocked<AuthService>;

    beforeEach(async () => {
      const mockAuthService = {
        validateLocalUser: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LocalStrategy,
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
        ],
      }).compile();

      strategy = module.get<LocalStrategy>(LocalStrategy);
      authService = module.get(AuthService) as jest.Mocked<AuthService>;
    });

    it('should validate and return user for correct email/password', async () => {
      authService.validateLocalUser.mockResolvedValue(mockUser);

      const result = await strategy.validate('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(authService.validateLocalUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.validateLocalUser.mockResolvedValue(null);

      await expect(
        strategy.validate('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      authService.validateLocalUser.mockResolvedValue(null);

      await expect(
        strategy.validate('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let authService: jest.Mocked<AuthService>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
      const mockAuthService = {
        validateJwtUser: jest.fn(),
      };

      const mockConfigService = {
        get: jest.fn((key: string) => {
          const config: Record<string, any> = {
            'auth.jwtAccessSecret': 'access_secret',
          };
          return config[key];
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      strategy = module.get<JwtStrategy>(JwtStrategy);
      authService = module.get(AuthService) as jest.Mocked<AuthService>;
      configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
    });

    it('should validate access token and return user', async () => {
      authService.validateJwtUser.mockResolvedValue(mockUser);

      const payload = {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        type: 'access' as const,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual(mockUser);
      expect(authService.validateJwtUser).toHaveBeenCalledWith(payload);
    });

    it('should reject refresh token (wrong type)', async () => {
      const payload = {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        type: 'refresh' as const,
        version: 1,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateJwtUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      authService.validateJwtUser.mockResolvedValue(null);

      const payload = {
        sub: 'invalid-id',
        type: 'access' as const,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('GoogleStrategy', () => {
    let strategy: GoogleStrategy;
    let authService: jest.Mocked<AuthService>;
    let usersService: jest.Mocked<UsersService>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
      const mockAuthService = {};

      const mockUsersService = {
        findByGoogleId: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
      };

      const mockConfigService = {
        get: jest.fn((key: string) => {
          const config: Record<string, any> = {
            GOOGLE_CLIENT_ID: 'client_id',
            GOOGLE_CLIENT_SECRET: 'client_secret',
            GOOGLE_CALLBACK_URL: 'http://localhost:3000/callback',
          };
          return config[key];
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GoogleStrategy,
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
          {
            provide: UsersService,
            useValue: mockUsersService,
          },
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      strategy = module.get<GoogleStrategy>(GoogleStrategy);
      authService = module.get(AuthService) as jest.Mocked<AuthService>;
      usersService = module.get(UsersService) as jest.Mocked<UsersService>;
      configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
    });

    it('should create new user if email does not exist', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockGoogleUser);

      const profile = {
        id: 'google_id_123',
        email: 'google@example.com',
      };

      const done = jest.fn();

      await strategy.validate('access_token', 'refresh_token', profile, done);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google_id_123');
      expect(usersService.findByEmail).toHaveBeenCalledWith('google@example.com');
      expect(usersService.create).toHaveBeenCalledWith(
        'google@example.com',
        undefined,
        'google_id_123',
      );
      expect(done).toHaveBeenCalledWith(null, mockGoogleUser);
    });

    it('should find existing user by googleId', async () => {
      usersService.findByGoogleId.mockResolvedValue(mockGoogleUser);

      const profile = {
        id: 'google_id_123',
        email: 'google@example.com',
      };

      const done = jest.fn();

      await strategy.validate('access_token', 'refresh_token', profile, done);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google_id_123');
      expect(usersService.findByEmail).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
      expect(done).toHaveBeenCalledWith(null, mockGoogleUser);
    });

    it('should find existing user by email if googleId not found', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(mockUser);

      const profile = {
        id: 'new_google_id',
        email: 'test@example.com',
      };

      const done = jest.fn();

      await strategy.validate('access_token', 'refresh_token', profile, done);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('new_google_id');
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).not.toHaveBeenCalled();
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it('should handle errors from validate', async () => {
      const error = new Error('Database error');
      usersService.findByGoogleId.mockRejectedValue(error);

      const profile = {
        id: 'google_id_123',
        email: 'google@example.com',
      };

      const done = jest.fn();

      await strategy.validate('access_token', 'refresh_token', profile, done);

      expect(done).toHaveBeenCalledWith(error);
    });
  });
});
