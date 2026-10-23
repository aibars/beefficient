/**
 * Datos de ejemplo para dev/test. Mirrors `apps/web/src/lib/mockData.ts` so the
 * web app shows the same content once it switches from mocks to the API.
 *
 * Ids are fixed UUIDs so the seed is idempotent: running it again updates the
 * same rows instead of duplicating them. The web mock ids are kept in comments.
 */
import { DataSource } from 'typeorm';
import { Producer } from '../../src/producers/producer.entity';
import { Technician } from '../../src/technicians/technician.entity';
import { Price } from '../../src/prices/price.entity';
import { Kpi } from '../../src/kpis/kpi.entity';

const PRODUCER_IDS = {
  '1': '6f1d2a10-0000-4000-8000-000000000001',
  '2': '6f1d2a10-0000-4000-8000-000000000002',
  '3': '6f1d2a10-0000-4000-8000-000000000003',
  '4': '6f1d2a10-0000-4000-8000-000000000004',
  '5': '6f1d2a10-0000-4000-8000-000000000005',
} as const;

type MockProducerId = keyof typeof PRODUCER_IDS;

export const seedProducers: Array<
  Pick<
    Producer,
    | 'id'
    | 'name'
    | 'region'
    | 'rodeoCount'
    | 'lastActivity'
    | 'status'
    | 'totalHeads'
    | 'totalHa'
    | 'avgWeightGain'
  >
> = [
  {
    id: PRODUCER_IDS['1'],
    name: 'Estancia Los Álamos',
    region: 'Buenos Aires',
    rodeoCount: 3,
    lastActivity: new Date('2026-10-14'),
    status: 'active',
    totalHeads: 250,
    totalHa: 180,
    avgWeightGain: 0.85,
  },
  {
    id: PRODUCER_IDS['2'],
    name: 'Campo San Martín',
    region: 'La Pampa',
    rodeoCount: 2,
    lastActivity: new Date('2026-10-12'),
    status: 'active',
    totalHeads: 180,
    totalHa: 120,
    avgWeightGain: 0.72,
  },
  {
    id: PRODUCER_IDS['3'],
    name: 'Chacra Utracán',
    region: 'La Pampa',
    rodeoCount: 4,
    lastActivity: new Date('2026-10-15'),
    status: 'active',
    totalHeads: 420,
    totalHa: 280,
    avgWeightGain: 0.9,
  },
  {
    id: PRODUCER_IDS['4'],
    name: 'Establecimiento Valle Verde',
    region: 'Córdoba',
    rodeoCount: 2,
    lastActivity: new Date('2026-10-10'),
    status: 'inactive',
    totalHeads: 150,
    totalHa: 100,
    avgWeightGain: 0.6,
  },
  {
    id: PRODUCER_IDS['5'],
    name: 'Finca El Rodeo',
    region: 'Santiago del Estero',
    rodeoCount: 3,
    lastActivity: new Date('2026-10-13'),
    status: 'active',
    totalHeads: 310,
    totalHa: 200,
    avgWeightGain: 0.78,
  },
];

export const seedTechnicians: Array<
  Pick<Technician, 'id' | 'name' | 'specialization' | 'contact'> & {
    producers: MockProducerId[];
  }
> = [
  {
    id: '7a2e3b20-0000-4000-8000-000000000001', // t1
    name: 'Gastón Alfaro',
    specialization: 'Nutrición Bovina',
    contact: 'gaston@beefficient.com',
    producers: ['1', '3'],
  },
  {
    id: '7a2e3b20-0000-4000-8000-000000000002', // t2
    name: 'Federico Podversich',
    specialization: 'Sanidad Animal',
    contact: 'federico@beefficient.com',
    producers: ['2', '4', '5'],
  },
  {
    id: '7a2e3b20-0000-4000-8000-000000000003', // t3
    name: 'Mariana García',
    specialization: 'Gestión de Pasturas',
    contact: 'mariana@beefficient.com',
    producers: ['1', '2'],
  },
];

const PRICE_DATE = new Date('2026-10-15');

export const seedPrices: Array<
  Pick<
    Price,
    'id' | 'commodity' | 'value' | 'currency' | 'change' | 'timestamp' | 'source'
  >
> = [
  {
    id: '8b3f4c30-0000-4000-8000-000000000001', // p1
    commodity: 'Ternero',
    value: 2850,
    currency: 'ARS',
    change: 2.3,
    timestamp: PRICE_DATE,
    source: 'Mercado Agroganadero',
  },
  {
    id: '8b3f4c30-0000-4000-8000-000000000002', // p2
    commodity: 'Novillos',
    value: 3200,
    currency: 'ARS',
    change: 1.8,
    timestamp: PRICE_DATE,
    source: 'Mercado Agroganadero',
  },
  {
    id: '8b3f4c30-0000-4000-8000-000000000003', // p3
    commodity: 'Maíz',
    value: 320,
    currency: 'ARS/kg',
    change: -0.5,
    timestamp: PRICE_DATE,
    source: 'BCBA',
  },
  {
    id: '8b3f4c30-0000-4000-8000-000000000004', // p4
    commodity: 'Soja',
    value: 445,
    currency: 'ARS/kg',
    change: 1.2,
    timestamp: PRICE_DATE,
    source: 'BCBA',
  },
  {
    id: '8b3f4c30-0000-4000-8000-000000000005', // p5
    commodity: 'Sorgo',
    value: 285,
    currency: 'ARS/kg',
    change: 0,
    timestamp: PRICE_DATE,
    source: 'BCBA',
  },
  {
    id: '8b3f4c30-0000-4000-8000-000000000006', // p6
    commodity: 'Alfalfa',
    value: 185,
    currency: 'ARS/kg',
    change: -0.3,
    timestamp: PRICE_DATE,
    source: 'Mercados Locales',
  },
];

export const seedKpis: Array<
  Pick<Kpi, 'id' | 'label' | 'value' | 'unit' | 'delta' | 'status'>
> = [
  {
    id: '9c405d40-0000-4000-8000-000000000001', // kpi1
    label: 'Carga por hectárea',
    value: 1.4,
    unit: 'rac/ha',
    delta: 5.2,
    status: 'good',
  },
  {
    id: '9c405d40-0000-4000-8000-000000000002', // kpi2
    label: 'Promedio de ganancia',
    value: 0.82,
    unit: 'kg/día',
    delta: 2.1,
    status: 'good',
  },
  {
    id: '9c405d40-0000-4000-8000-000000000003', // kpi3
    label: 'Consumo de MS',
    value: 12.5,
    unit: 'kg/día',
    delta: -0.8,
    status: 'good',
  },
  {
    id: '9c405d40-0000-4000-8000-000000000004', // kpi4
    label: 'Eficiencia de cosecha',
    value: 58,
    unit: '%',
    delta: 3.4,
    status: 'warning',
  },
];

/** Upserts the mock data. Safe to run repeatedly. */
export async function seedMockData(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (manager) => {
    await manager.getRepository(Producer).upsert(seedProducers, ['id']);

    await manager.getRepository(Technician).upsert(
      seedTechnicians.map(({ producers: _producers, ...technician }) => technician),
      ['id'],
    );

    // Join rows: insert missing assignments, keep existing ones.
    const assignments = seedTechnicians.flatMap((technician) =>
      technician.producers.map((mockId) => ({
        technician_id: technician.id,
        producer_id: PRODUCER_IDS[mockId],
      })),
    );
    await manager
      .createQueryBuilder()
      .insert()
      .into('technician_producers')
      .values(assignments)
      .orIgnore()
      .execute();

    await manager.getRepository(Price).upsert(seedPrices, ['id']);
    await manager.getRepository(Kpi).upsert(seedKpis, ['id']);
  });
}
