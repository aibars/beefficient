import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserDeviceTokenRepository } from './user-device-token.repository';
import { UserDeviceToken } from './user-device-token.entity';
import { DeviceResponseDto } from './dto';

@Injectable()
export class DeviceTokensService {
  constructor(
    private readonly deviceTokenRepository: UserDeviceTokenRepository,
  ) {}

  async registerDevice(
    userId: string,
    deviceToken: string,
    platform: 'ios' | 'android',
  ): Promise<DeviceResponseDto> {
    const existing = await this.deviceTokenRepository.findByUserIdAndToken(
      userId,
      deviceToken,
    );
    if (existing) {
      throw new ConflictException(
        'Device token already registered for this user',
      );
    }

    const device = await this.deviceTokenRepository.createToken(
      userId,
      deviceToken,
      platform,
    );
    return this.toResponse(device);
  }

  async deregisterDevice(deviceTokenId: string, userId: string): Promise<void> {
    const device = await this.deviceTokenRepository.findById(deviceTokenId);
    if (!device) {
      throw new NotFoundException('Device token not found');
    }
    if (device.userId !== userId) {
      throw new ForbiddenException('User does not own this device');
    }
    await this.deviceTokenRepository.deleteById(deviceTokenId);
  }

  async listDevicesByUserId(userId: string): Promise<DeviceResponseDto[]> {
    const devices = await this.deviceTokenRepository.findByUserId(userId);
    return devices.map((device) => this.toResponse(device));
  }

  private toResponse(device: UserDeviceToken): DeviceResponseDto {
    return {
      device_token_id: device.id,
      device_token: device.deviceToken,
      platform: device.platform,
    };
  }
}
