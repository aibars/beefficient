import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { configSchema } from './config/config.schema';
import { DatabaseConfig } from './config/database.config';
import { authConfig } from './config/auth.config';

import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FarmsModule } from './farms/farms.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  controllers: [AppController],
  imports: [
    // Configuration management
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
      expandVariables: true,
      // Exposes `auth.*` keys (jwtAccessSecret, etc.) consumed by AuthModule.
      load: [() => ({ auth: authConfig() })],
    }),

    // Database connection
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        DatabaseConfig.getOrmConfig(configService),
    }),

    // Rate limiting (global throttler)
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 100,
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 1000,
      },
    ]),

    // Feature modules
    UsersModule,
    AuthModule,
    FarmsModule,
    DevicesModule,
  ],
})
export class AppModule {}
