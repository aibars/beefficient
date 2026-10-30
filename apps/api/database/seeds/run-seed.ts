/**
 * Seeds the dev/test database with the web app's mock data.
 *
 *   pnpm --filter @beefficient/api db:seed
 *
 * Refuses to run when NODE_ENV=production.
 */
import { AppDataSource } from '../../data-source';
import { seedMockData } from './mock-data.seed';
import { seedPlanilla } from './planilla.seed';

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed mock data with NODE_ENV=production.');
  }

  await AppDataSource.initialize();
  try {
    await seedMockData(AppDataSource);
    await seedPlanilla(AppDataSource);

    const counts = await AppDataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM producers)::int AS producers,
        (SELECT COUNT(*) FROM technicians)::int AS technicians,
        (SELECT COUNT(*) FROM technician_producers)::int AS technician_producers,
        (SELECT COUNT(*) FROM prices)::int AS prices,
        (SELECT COUNT(*) FROM kpis)::int AS kpis,
        (SELECT COUNT(*) FROM potreros)::int AS potreros,
        (SELECT COUNT(*) FROM lotes)::int AS lotes,
        (SELECT COUNT(*) FROM campanas)::int AS campanas,
        (SELECT COUNT(*) FROM rodeos)::int AS rodeos,
        (SELECT COUNT(*) FROM pastoreos)::int AS pastoreos
    `);
    console.log('Seed complete:', counts[0]);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
