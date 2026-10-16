import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DeviceTokensService } from './device-tokens.service';
import { UserDeviceTokenRepository } from './user-device-token.repository';
import { UserDeviceToken } from './user-device-token.entity';

describe('DeviceTokensService', () => {
  let service: DeviceTokensService;
  let repo: {
    findByUserIdAndToken: jest.Mock;
    createToken: jest.Mock;
    findById: jest.Mock;
    findByUserId: jest.Mock;
    deleteById: jest.Mock;
  };

  const userId = 'user-uuid-1';
  const buildDevice = (
    overrides: Partial<UserDeviceToken> = {},
  ): UserDeviceToken =>
    ({
      id: 'device-uuid-1',
      userId,
      deviceToken: 'fcm-token-abc',
      platform: 'android',
      createdAt: new Date(),
      ...overrides,
    }) as UserDeviceToken;

  beforeEach(async () => {
    repo = {
      findByUserIdAndToken: jest.fn(),
      createToken: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      deleteById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceTokensService,
        { provide: UserDeviceTokenRepository, useValue: repo },
      ],
    }).compile();

    service = module.get(DeviceTokensService);
  });

  describe('registerDevice', () => {
    it('registers device if not already registered', async () => {
      repo.findByUserIdAndToken.mockResolvedValue(null);
      repo.createToken.mockResolvedValue(buildDevice());

      const result = await service.registerDevice(
        userId,
        'fcm-token-abc',
        'android',
      );

      expect(repo.findByUserIdAndToken).toHaveBeenCalledWith(
        userId,
        'fcm-token-abc',
      );
      expect(repo.createToken).toHaveBeenCalledWith(
        userId,
        'fcm-token-abc',
        'android',
      );
      expect(result).toEqual({
        device_token_id: 'device-uuid-1',
        device_token: 'fcm-token-abc',
        platform: 'android',
      });
    });

    it('rejects duplicate token with 409', async () => {
      repo.findByUserIdAndToken.mockResolvedValue(buildDevice());

      await expect(
        service.registerDevice(userId, 'fcm-token-abc', 'android'),
      ).rejects.toThrow(ConflictException);
      expect(repo.createToken).not.toHaveBeenCalled();
    });
  });

  describe('deregisterDevice', () => {
    it('removes device if user is owner', async () => {
      repo.findById.mockResolvedValue(buildDevice());
      repo.deleteById.mockResolvedValue(undefined);

      await expect(
        service.deregisterDevice('device-uuid-1', userId),
      ).resolves.toBeUndefined();
      expect(repo.deleteById).toHaveBeenCalledWith('device-uuid-1');
    });

    it('forbids (403) if user is not owner', async () => {
      repo.findById.mockResolvedValue(buildDevice({ userId: 'other-user' }));

      await expect(
        service.deregisterDevice('device-uuid-1', userId),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.deleteById).not.toHaveBeenCalled();
    });

    it('fails with 404 if device not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.deregisterDevice('missing', userId),
      ).rejects.toThrow(NotFoundException);
      expect(repo.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('listDevicesByUserId', () => {
    it('returns all devices for user', async () => {
      repo.findByUserId.mockResolvedValue([
        buildDevice(),
        buildDevice({
          id: 'device-uuid-2',
          deviceToken: 'apns-token-xyz',
          platform: 'ios',
        }),
      ]);

      const result = await service.listDevicesByUserId(userId);

      expect(repo.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([
        {
          device_token_id: 'device-uuid-1',
          device_token: 'fcm-token-abc',
          platform: 'android',
        },
        {
          device_token_id: 'device-uuid-2',
          device_token: 'apns-token-xyz',
          platform: 'ios',
        },
      ]);
    });

    it('returns empty array when user has no devices', async () => {
      repo.findByUserId.mockResolvedValue([]);
      await expect(service.listDevicesByUserId(userId)).resolves.toEqual([]);
    });
  });
});
