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

/** Envelope returned by the API: `{ data }`, plus `meta` on paginated lists. */
export type ApiMeta = { total: number; page: number; limit: number };
export type ApiResponse<T> = { data: T; meta?: ApiMeta };

/** Producer as serialized by the API (flat metrics, ISO date strings). */
export interface ApiProducer {
  id: string;
  name: string;
  region: string;
  rodeoCount: number;
  lastActivity: string | null;
  status: 'active' | 'inactive';
  totalHeads: number;
  totalHa: number;
  avgWeightGain: number;
}

/** Technician as serialized by the API (`producerIds` is present on list/detail). */
export interface ApiTechnician {
  id: string;
  name: string;
  specialization: string;
  contact: string;
  producerIds?: string[];
}

/** Price as serialized by the API (timestamp is an ISO string). */
export interface ApiPrice extends Omit<Price, 'timestamp'> {
  timestamp: string;
}

/** KPI as serialized by the API (`delta` and `status` may be null). */
export interface ApiKPI extends Omit<KPI, 'delta' | 'status'> {
  delta: number | null;
  status: 'good' | 'warning' | 'alert' | null;
}
