import { extname, join } from 'path';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Resolved relative to this file so the same globs work from src/ (ts-jest,
// ts-node) and from dist/ (nest build). Matching this file's own extension
// keeps the compiled .d.ts files out of the dist/ globs.
const ext = extname(__filename);
const srcRoot = join(__dirname, '..');

export const ENTITIES_GLOB = join(srcRoot, '**', `*.entity${ext}`);
export const MIGRATIONS_GLOB = join(srcRoot, 'database', 'migrations', `*${ext}`);

export class DatabaseConfig {
  static getOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    return {
      type: 'postgres',
      host: configService.get<string>('DATABASE_HOST', 'localhost'),
      port: configService.get<number>('DATABASE_PORT', 5432),
      username: configService.get<string>('DATABASE_USER', 'postgres'),
      password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
      database: configService.get<string>('DATABASE_NAME', 'beefficient'),
      entities: [ENTITIES_GLOB],
      migrations: [MIGRATIONS_GLOB],
      // The schema is owned by the migrations in every environment; never let
      // synchronize derive it from the entities.
      migrationsRun: true,
      synchronize: false,
      logging: nodeEnv === 'development',
      ssl: configService.get<boolean>('DATABASE_SSL', nodeEnv === 'production'),
    };
  }
}

/**
 * Deprecated: Use DatabaseConfig.getOrmConfig(configService) instead.
 * Kept for backwards compatibility.
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'beefficient',
  entities: [ENTITIES_GLOB],
  migrations: [MIGRATIONS_GLOB],
  migrationsRun: true,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DATABASE_SSL
    ? process.env.DATABASE_SSL === 'true'
    : process.env.NODE_ENV === 'production',
});
