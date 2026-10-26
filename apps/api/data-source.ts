import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Used by the typeorm CLI scripts, which always run through ts-node, so it
// reads the TypeScript sources in every environment.
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'beefficient',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  // Development: auto-sync schema from entities; Production: run migrations
  migrationsRun: process.env.NODE_ENV === 'production',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: false,
  ssl: process.env.DATABASE_SSL
    ? process.env.DATABASE_SSL === 'true'
    : process.env.NODE_ENV === 'production',
});
