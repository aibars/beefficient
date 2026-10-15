import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  device_token: string;

  @IsIn(['ios', 'android'])
  @IsNotEmpty()
  platform: 'ios' | 'android';
}
