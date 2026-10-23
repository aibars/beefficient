import { apiFetch } from '@/lib/api';
import type { ApiKPI, ApiResponse, KPI } from '@/lib/types';

export async function getKPIs(): Promise<KPI[]> {
  const res = await apiFetch<ApiResponse<ApiKPI[]>>('/kpis');
  return res.data.map(({ delta, status, ...k }) => ({
    ...k,
    ...(delta !== null && { delta }),
    ...(status !== null && { status }),
  }));
}
