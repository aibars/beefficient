export type UserRole = 'productor' | 'tecnico';

export interface Producer {
  id: string;
  name: string;
  region: string;
  rodeoCount: number;
  lastActivity: Date;
  status: 'active' | 'inactive';
  metrics: {
    totalHeads: number;
    totalHa: number;
    avgWeightGain: number;
  };
}

export interface Technician {
  id: string;
  name: string;
  specialization: string;
  producerIds: string[];
  contact: string;
}

export interface Price {
  id: string;
  commodity: string;
  value: number;
  currency: string;
  change: number;
  timestamp: Date;
  source: string;
}

export interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  delta?: number;
  status?: 'good' | 'warning' | 'alert';
}

export interface Weather {
  city: string;
  temp: number;
  condition: string;
}

export interface HomeData {
  greeting: string;
  intro: string;
  kpis: KPI[];
  weather: Weather;
  note: string;
}
