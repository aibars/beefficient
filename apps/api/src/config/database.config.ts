import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'beefficient',
  entities: ['src/**/*.entity.ts'],
  migrations: ['database/migrations/*.ts'],
  migrationsRun: true,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production',
});
