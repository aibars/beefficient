// Datos de ejemplo para las stories de pantallas (vienen de @beefficient/domain).
import { ESTABLECIMIENTO_EJEMPLO, LOTES, PASTOREOS, RODEOS, type Pastoreo } from '@beefficient/domain';

export const SUBTITULO = `${ESTABLECIMIENTO_EJEMPLO.nombre} · Campaña ${ESTABLECIMIENTO_EJEMPLO.campana}`;
export const ESTABLECIMIENTO = ESTABLECIMIENTO_EJEMPLO.nombre;
export { LOTES, PASTOREOS, RODEOS };

/** Pastoreo recién guardado sin señal, todavía sin subir. */
export const PASTOREO_PENDIENTE: Pastoreo = {
  id: 'nuevo',
  loteId: 7,
  rodeoId: 'a',
  cabezas: 120,
  entrada: '2026-04-03',
  salida: '2026-04-17',
  sincronizado: false,
};
