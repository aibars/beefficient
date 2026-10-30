import { apiFetch } from '@/lib/api';
import type {
  Campana,
  LoteCampana,
  PastoreoCampana,
  RodeoCampana,
} from '@beefficient/domain';

export interface Potrero {
  id: string;
  nombre: string;
  hectareas: number;
}
export interface Lote extends LoteCampana {
  potreroId: string | null;
}
export interface CampanaResumen {
  id: string;
  anio: number;
  mesServicio: number;
  eficienciaCosecha: number;
}
export interface CampanaCompleta extends Campana {
  id: string;
}
export type DatosRodeo = Omit<RodeoCampana, 'id'>;
export type DatosPastoreo = Omit<PastoreoCampana, 'id'>;

interface Envoltorio<T> {
  data: T;
}

async function pedir<T>(ruta: string, metodo?: string, body?: unknown): Promise<T> {
  const res = await apiFetch<Envoltorio<T>>(ruta, {
    ...(metodo ? { method: metodo } : {}),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return res.data;
}

async function borrar(ruta: string): Promise<void> {
  await apiFetch<void>(ruta, { method: 'DELETE' });
}

const e = encodeURIComponent;

// Campañas
export const listarCampanas = () => pedir<CampanaResumen[]>('/campanas');
export const obtenerCampana = (id: string) =>
  pedir<CampanaCompleta>(`/campanas/${e(id)}`);
export const crearCampana = (anio: number) =>
  pedir<CampanaResumen>('/campanas', 'POST', { anio });
export const actualizarCampana = (
  id: string,
  cambios: Partial<Pick<CampanaResumen, 'mesServicio' | 'eficienciaCosecha'>>,
) => pedir<CampanaResumen>(`/campanas/${e(id)}`, 'PATCH', cambios);

// Potreros
export const listarPotreros = () => pedir<Potrero[]>('/potreros');
export const crearPotrero = (d: Omit<Potrero, 'id'>) =>
  pedir<Potrero>('/potreros', 'POST', d);
export const actualizarPotrero = (id: string, d: Partial<Omit<Potrero, 'id'>>) =>
  pedir<Potrero>(`/potreros/${e(id)}`, 'PATCH', d);
export const borrarPotrero = (id: string) => borrar(`/potreros/${e(id)}`);

// Lotes
export const listarLotes = () => pedir<Lote[]>('/lotes');
export const crearLote = (d: Omit<Lote, 'id'>) => pedir<Lote>('/lotes', 'POST', d);
export const actualizarLote = (id: string, d: Partial<Omit<Lote, 'id'>>) =>
  pedir<Lote>(`/lotes/${e(id)}`, 'PATCH', d);
export const borrarLote = (id: string) => borrar(`/lotes/${e(id)}`);

// Rodeos
export const crearRodeo = (
  campanaId: string,
  d: Partial<DatosRodeo> & { nombre: string },
) => pedir<RodeoCampana>(`/campanas/${e(campanaId)}/rodeos`, 'POST', d);
export const actualizarRodeo = (
  campanaId: string,
  id: string,
  d: Partial<DatosRodeo>,
) => pedir<RodeoCampana>(`/campanas/${e(campanaId)}/rodeos/${e(id)}`, 'PATCH', d);
export const borrarRodeo = (campanaId: string, id: string) =>
  borrar(`/campanas/${e(campanaId)}/rodeos/${e(id)}`);

// Pastoreos
export const crearPastoreo = (campanaId: string, d: Partial<DatosPastoreo>) =>
  pedir<PastoreoCampana>(`/campanas/${e(campanaId)}/pastoreos`, 'POST', d);
export const actualizarPastoreo = (
  campanaId: string,
  id: string,
  d: Partial<DatosPastoreo>,
) =>
  pedir<PastoreoCampana>(`/campanas/${e(campanaId)}/pastoreos/${e(id)}`, 'PATCH', d);
export const borrarPastoreo = (campanaId: string, id: string) =>
  borrar(`/campanas/${e(campanaId)}/pastoreos/${e(id)}`);
