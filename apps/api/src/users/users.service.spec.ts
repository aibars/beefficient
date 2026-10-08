import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './users.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
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

  beforeEach(async () => {
    const mockUsersRepository = {
      findByEmail: jest.fn(),
      findByGoogleId: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository) as jest.Mocked<UsersRepository>;
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
      expect(repository.findByEmail).toHaveBeenCalledWith('notfound@example.com');
    });
  });

  describe('findByGoogleId', () => {
    it('should return a user when OAuth user found', async () => {
      repository.findByGoogleId.mockResolvedValue(mockGoogleUser);

      const result = await service.findByGoogleId('google_id_123');

      expect(result).toEqual(mockGoogleUser);
      expect(repository.findByGoogleId).toHaveBeenCalledWith('google_id_123');
    });

    it('should return null when OAuth user not found', async () => {
      repository.findByGoogleId.mockResolvedValue(null);

      const result = await service.findByGoogleId('nonexistent_google_id');

      expect(result).toBeNull();
      expect(repository.findByGoogleId).toHaveBeenCalledWith('nonexistent_google_id');
    });
  });

  describe('create', () => {
    it('should create a user with password_hash only', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.createUser.mockResolvedValue(mockUser);

      const result = await service.create('test@example.com', 'hashed_password');

      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(repository.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'hashed_password',
        undefined,
      );
    });

    it('should create a user with google_id only', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.createUser.mockResolvedValue(mockGoogleUser);

      const result = await service.create(
        'google@example.com',
        undefined,
        'google_id_123',
      );

      expect(result).toEqual(mockGoogleUser);
      expect(repository.findByEmail).toHaveBeenCalledWith('google@example.com');
      expect(repository.createUser).toHaveBeenCalledWith(
        'google@example.com',
        undefined,
        'google_id_123',
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.create('test@example.com', 'hashed_password'),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.create('test@example.com', 'hashed_password'),
      ).rejects.toThrow('Email already registered');

      expect(repository.createUser).not.toHaveBeenCalled();
    });
  });

  describe('updateLastLogin', () => {
    it('should update the last login timestamp', async () => {
      repository.updateLastLogin.mockResolvedValue(undefined);

      await service.updateLastLogin('550e8400-e29b-41d4-a716-446655440000');

      expect(repository.updateLastLogin).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toEqual(mockUser);
      expect(repository.findById).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
    });

    it('should return null when user id not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith('nonexistent-id');
    });
  });
});
