import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = nodeEnv === 'development';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'beefficient',
  entities: isDev ? ['src/**/*.entity.ts'] : ['dist/**/*.entity.js'],
  migrations: isDev ? ['database/migrations/*.ts'] : ['dist/database/migrations/*.js'],
  migrationsRun: false,
  synchronize: false,
  logging: false,
});
