import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserDeviceToken } from './user-device-token.entity';

@Injectable()
export class UserDeviceTokenRepository extends Repository<UserDeviceToken> {
  constructor(private dataSource: DataSource) {
    super(UserDeviceToken, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<UserDeviceToken | null> {
    return this.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<UserDeviceToken[]> {
    return this.find({ where: { userId } });
  }

  async findByUserIdAndToken(
    userId: string,
    deviceToken: string,
  ): Promise<UserDeviceToken | null> {
    return this.findOne({ where: { userId, deviceToken } });
  }

  async createToken(
    userId: string,
    deviceToken: string,
    platform: 'ios' | 'android',
  ): Promise<UserDeviceToken> {
    const token = this.create({ userId, deviceToken, platform });
    return this.save(token);
  }

  async deleteById(id: string): Promise<void> {
    await this.delete(id);
  }
}
