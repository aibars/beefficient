import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class DatabaseConfig {
  static getOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const isProd = nodeEnv === 'production';

    return {
      type: 'postgres',
      host: configService.get<string>('DATABASE_HOST', 'localhost'),
      port: configService.get<number>('DATABASE_PORT', 5432),
      username: configService.get<string>('DATABASE_USER', 'postgres'),
      password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
      database: configService.get<string>('DATABASE_NAME', 'beefficient'),
      entities: isProd ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
      migrations: isProd ? ['dist/database/migrations/*.js'] : ['database/migrations/*.ts'],
      migrationsRun: !isProd,
      synchronize: false,
      logging: !isProd,
      ssl: isProd,
    };
  }
}

/**
 * Deprecated: Use DatabaseConfig.getOrmConfig(configService) instead.
 * Kept for backwards compatibility.
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'beefficient',
    entities: isProd ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
    migrations: isProd ? ['dist/database/migrations/*.js'] : ['database/migrations/*.ts'],
    migrationsRun: !isProd,
    synchronize: false,
    logging: !isProd,
    ssl: isProd,
  };
};
