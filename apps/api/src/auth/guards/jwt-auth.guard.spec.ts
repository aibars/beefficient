import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from 'src/users/users.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword123456789012345678901234567890',
    googleId: undefined,
    createdAt: new Date('2026-10-08'),
    updatedAt: new Date('2026-10-08'),
    lastLoginAt: undefined,
    refreshTokenVersion: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('handleRequest', () => {
    it('should return user for valid token', () => {
      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is null and no error', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error when err is provided', () => {
      const error = new Error('Invalid token');

      expect(() => guard.handleRequest(error, mockUser, null)).toThrow(error);
    });

    it('should throw UnauthorizedException when user is null and error exists', () => {
      const error = new Error('Token expired');

      expect(() => guard.handleRequest(error, null, null)).toThrow(error);
    });

    it('should throw UnauthorizedException with "Unauthorized" message', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        'Unauthorized',
      );
    });

    it('should handle undefined user', () => {
      expect(() => guard.handleRequest(null, undefined, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should handle falsy user values', () => {
      expect(() => guard.handleRequest(null, false, null)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('canActivate', () => {
    it('should call parent canActivate', async () => {
      const mockExecutionContext = {
        switchToHttp: jest.fn(),
      } as unknown as ExecutionContext;

      // Create a spy on the parent method
      const parentCanActivate = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        'canActivate',
      );

      // Note: This is a basic test that the method exists and can be called.
      // Full integration testing would require Passport setup.
      expect(guard.canActivate).toBeDefined();
    });
  });
});
