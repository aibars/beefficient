/**
 * @deprecated Mock data is no longer used by any page; pages call the API
 * services in `src/services`. Kept temporarily for reference.
 */
import { Producer, Technician, Price, KPI, Weather, HomeData } from './types';

export const mockProducers: Producer[] = [
  {
    id: '1',
    name: 'Estancia Los Álamos',
    region: 'Buenos Aires',
    rodeoCount: 3,
    lastActivity: new Date('2026-10-14'),
    status: 'active',
    metrics: {
      totalHeads: 250,
      totalHa: 180,
      avgWeightGain: 0.85,
    },
  },
  {
    id: '2',
    name: 'Campo San Martín',
    region: 'La Pampa',
    rodeoCount: 2,
    lastActivity: new Date('2026-10-12'),
    status: 'active',
    metrics: {
      totalHeads: 180,
      totalHa: 120,
      avgWeightGain: 0.72,
    },
  },
  {
    id: '3',
    name: 'Chacra Utracán',
    region: 'La Pampa',
    rodeoCount: 4,
    lastActivity: new Date('2026-10-15'),
    status: 'active',
    metrics: {
      totalHeads: 420,
      totalHa: 280,
      avgWeightGain: 0.9,
    },
  },
  {
    id: '4',
    name: 'Establecimiento Valle Verde',
    region: 'Córdoba',
    rodeoCount: 2,
    lastActivity: new Date('2026-10-10'),
    status: 'inactive',
    metrics: {
      totalHeads: 150,
      totalHa: 100,
      avgWeightGain: 0.6,
    },
  },
  {
    id: '5',
    name: 'Finca El Rodeo',
    region: 'Santiago del Estero',
    rodeoCount: 3,
    lastActivity: new Date('2026-10-13'),
    status: 'active',
    metrics: {
      totalHeads: 310,
      totalHa: 200,
      avgWeightGain: 0.78,
    },
  },
];

export const mockTechnicians: Technician[] = [
  {
    id: 't1',
    name: 'Gastón Alfaro',
    specialization: 'Nutrición Bovina',
    producerIds: ['1', '3'],
    contact: 'gaston@beefficient.com',
  },
  {
    id: 't2',
    name: 'Federico Podversich',
    specialization: 'Sanidad Animal',
    producerIds: ['2', '4', '5'],
    contact: 'federico@beefficient.com',
  },
  {
    id: 't3',
    name: 'Mariana García',
    specialization: 'Gestión de Pasturas',
    producerIds: ['1', '2'],
    contact: 'mariana@beefficient.com',
  },
];

export const mockPrices: Price[] = [
  {
    id: 'p1',
    commodity: 'Ternero',
    value: 2850,
    currency: 'ARS',
    change: 2.3,
    timestamp: new Date('2026-10-15'),
    source: 'Mercado Agroganadero',
  },
  {
    id: 'p2',
    commodity: 'Novillos',
    value: 3200,
    currency: 'ARS',
    change: 1.8,
    timestamp: new Date('2026-10-15'),
    source: 'Mercado Agroganadero',
  },
  {
    id: 'p3',
    commodity: 'Maíz',
    value: 320,
    currency: 'ARS/kg',
    change: -0.5,
    timestamp: new Date('2026-10-15'),
    source: 'BCBA',
  },
  {
    id: 'p4',
    commodity: 'Soja',
    value: 445,
    currency: 'ARS/kg',
    change: 1.2,
    timestamp: new Date('2026-10-15'),
    source: 'BCBA',
  },
  {
    id: 'p5',
    commodity: 'Sorgo',
    value: 285,
    currency: 'ARS/kg',
    change: 0.0,
    timestamp: new Date('2026-10-15'),
    source: 'BCBA',
  },
  {
    id: 'p6',
    commodity: 'Alfalfa',
    value: 185,
    currency: 'ARS/kg',
    change: -0.3,
    timestamp: new Date('2026-10-15'),
    source: 'Mercados Locales',
  },
];

export const mockKPIs: KPI[] = [
  {
    id: 'kpi1',
    label: 'Carga por hectárea',
    value: 1.4,
    unit: 'rac/ha',
    delta: 5.2,
    status: 'good',
  },
  {
    id: 'kpi2',
    label: 'Promedio de ganancia',
    value: 0.82,
    unit: 'kg/día',
    delta: 2.1,
    status: 'good',
  },
  {
    id: 'kpi3',
    label: 'Consumo de MS',
    value: 12.5,
    unit: 'kg/día',
    delta: -0.8,
    status: 'good',
  },
  {
    id: 'kpi4',
    label: 'Eficiencia de cosecha',
    value: 58,
    unit: '%',
    delta: 3.4,
    status: 'warning',
  },
];

export const mockWeather: Weather = {
  city: 'Utracán, La Pampa',
  temp: 28,
  condition: 'Soleado',
};

export const mockHomeData: HomeData = {
  greeting: '¡Buen día!',
  intro: 'Bienvenido a tu panel de control de pastoreo.',
  kpis: mockKPIs,
  weather: mockWeather,
  note: 'Actualizaciones disponibles en los últimos registros de tus rodeos.',
};

export function getMockProducersForTechnician(technicianId: string): Producer[] {
  const tech = mockTechnicians.find((t) => t.id === technicianId);
  if (!tech) return [];
  return mockProducers.filter((p) => tech.producerIds.includes(p.id));
}
