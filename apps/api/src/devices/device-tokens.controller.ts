import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { DeviceTokensService } from './device-tokens.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Controller('device-tokens')
export class DeviceTokensController {
  constructor(private deviceTokensService: DeviceTokensService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  async registerDevice(
    @Body() registerDeviceDto: RegisterDeviceDto,
    @CurrentUser() user: User,
  ) {
    return this.deviceTokensService.registerDevice(
      user.id,
      registerDeviceDto.device_token,
      registerDeviceDto.platform,
    );
  }

  @Delete(':device_token_id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deregisterDevice(
    @Param('device_token_id') deviceTokenId: string,
    @CurrentUser() user: User,
  ) {
    await this.deviceTokensService.deregisterDevice(deviceTokenId, user.id);
  }
}
