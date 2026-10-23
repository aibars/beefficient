import { apiFetch, buildQuery } from '@/lib/api';
import type { ApiPrice, ApiResponse, Price } from '@/lib/types';

export async function getPrices(category?: string): Promise<Price[]> {
  const res = await apiFetch<ApiResponse<ApiPrice[]>>(
    `/prices${buildQuery({ category })}`,
  );
  return res.data.map((p) => ({ ...p, timestamp: new Date(p.timestamp) }));
}
