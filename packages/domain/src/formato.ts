// Formato es-AR sin depender de Intl (Hermes no garantiza `useGrouping: 'always'`).
import type { FechaISO } from './tipos';

/** 1603.2 → "1.603"; 114.48 con 1 decimal → "114,5". */
export function formatearNumero(valor: number, decimales = 0): string {
  const fijo = Math.abs(valor).toFixed(decimales);
  const [entero = '0', fraccion] = fijo.split('.');
  const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const esCero = Number(fijo) === 0;
  return `${valor < 0 && !esCero ? '-' : ''}${conMiles}${fraccion ? `,${fraccion}` : ''}`;
}

/** "2026-04-03" → "3/4". */
export function formatearFechaCorta(fecha: FechaISO): string {
  const [, m, d] = fecha.split('-');
  return `${Number(d)}/${Number(m)}`;
}
