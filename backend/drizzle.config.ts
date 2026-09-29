import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://beefficient:dev_password@localhost:5432/beefficient_dev',
  },
  verbose: true,
  strict: true,
});
