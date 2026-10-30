import { apiFetch } from '@/lib/api';

export interface Establecimiento {
  id: string;
  nombre: string;
  activo: boolean;
}

interface FarmsResponse {
  farms: { farm_id: string; farm_name: string; active: boolean }[];
}

export async function listarEstablecimientos(): Promise<Establecimiento[]> {
  const res = await apiFetch<FarmsResponse>('/auth/farms');
  return res.farms.map((f) => ({
    id: f.farm_id,
    nombre: f.farm_name,
    activo: f.active,
  }));
}

export async function activarEstablecimiento(id: string): Promise<void> {
  await apiFetch(`/auth/farm/${encodeURIComponent(id)}/active`, { method: 'PATCH' });
}
