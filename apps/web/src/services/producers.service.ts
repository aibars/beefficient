import { apiFetch, buildQuery } from '@/lib/api';
import type { ApiMeta, ApiProducer, ApiResponse, Producer } from '@/lib/types';

export function toProducer(p: ApiProducer): Producer {
  return {
    id: p.id,
    name: p.name,
    region: p.region,
    rodeoCount: p.rodeoCount,
    lastActivity: p.lastActivity ? new Date(p.lastActivity) : new Date(0),
    status: p.status,
    metrics: {
      totalHeads: p.totalHeads,
      totalHa: p.totalHa,
      avgWeightGain: p.avgWeightGain,
    },
  };
}

export async function getProducers(
  page?: number,
  limit?: number,
  region?: string,
  status?: string,
): Promise<{ data: Producer[]; meta: ApiMeta }> {
  const res = await apiFetch<ApiResponse<ApiProducer[]>>(
    `/producers${buildQuery({ page, limit, region, status })}`,
  );
  return {
    data: res.data.map(toProducer),
    meta: res.meta ?? { total: res.data.length, page: page ?? 1, limit: limit ?? res.data.length },
  };
}

export async function getProducerById(id: string): Promise<Producer> {
  const res = await apiFetch<ApiResponse<ApiProducer>>(
    `/producers/${encodeURIComponent(id)}`,
  );
  return toProducer(res.data);
}
