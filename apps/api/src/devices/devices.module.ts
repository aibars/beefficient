import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDeviceToken } from './user-device-token.entity';
import { UserDeviceTokenRepository } from './user-device-token.repository';
import { DeviceTokensService } from './device-tokens.service';
import { DeviceTokensController } from './device-tokens.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserDeviceToken])],
  controllers: [DeviceTokensController],
  providers: [UserDeviceTokenRepository, DeviceTokensService],
  exports: [DeviceTokensService],
})
export class DevicesModule {}
