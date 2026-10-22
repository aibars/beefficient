import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class DatabaseConfig {
  static getOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const isDevelopment = nodeEnv === 'development';

    return {
      type: 'postgres',
      host: configService.get<string>('DATABASE_HOST', 'localhost'),
      port: configService.get<number>('DATABASE_PORT', 5432),
      username: configService.get<string>('DATABASE_USER', 'postgres'),
      password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
      database: configService.get<string>('DATABASE_NAME', 'beefficient'),
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
      migrationsRun: isDevelopment,
      synchronize: isDevelopment,
      logging: isDevelopment,
      ssl: !isDevelopment,
    };
  }
}

/**
 * Deprecated: Use DatabaseConfig.getOrmConfig(configService) instead.
 * Kept for backwards compatibility.
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'beefficient',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/database/migrations/*.js'],
    migrationsRun: isDevelopment,
    synchronize: isDevelopment,
    logging: isDevelopment,
    ssl: !isDevelopment,
  };
};
