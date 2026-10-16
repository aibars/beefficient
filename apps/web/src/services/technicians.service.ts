import { apiFetch } from '@/lib/api';
import type { ApiProducer, ApiResponse, ApiTechnician, Producer, Technician } from '@/lib/types';
import { toProducer } from './producers.service';

export async function getTechnicians(): Promise<Technician[]> {
  const res = await apiFetch<ApiResponse<ApiTechnician[]>>('/technicians');
  return res.data.map((t) => ({ ...t, producerIds: t.producerIds ?? [] }));
}

export async function getProducersForTechnician(id: string): Promise<Producer[]> {
  const res = await apiFetch<ApiResponse<ApiProducer[]>>(
    `/technicians/${encodeURIComponent(id)}/producers`,
  );
  return res.data.map(toProducer);
}
