import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// TypeORM CLI needs compiled .js files; development uses TypeScript via ts-jest
const useCompiledFiles = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'beefficient',
  entities: useCompiledFiles ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
  migrations: useCompiledFiles ? ['dist/database/migrations/*.js'] : ['database/migrations/*.ts'],
  migrationsRun: false,
  synchronize: false,
  logging: false,
});
