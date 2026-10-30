import { formatearNumero } from '@beefficient/domain';
import type { Unidad } from '@/lib/planilla/vista';

/** Número del motor formateado; null → «—». */
export function num(valor: number | null | undefined, decimales = 0): string {
  return valor === null || valor === undefined ? '—' : formatearNumero(valor, decimales);
}

/** Hectáreas: enteras sin decimales, si no con uno. */
export function ha(valor: number | null | undefined): string {
  return valor === null || valor === undefined
    ? '—'
    : formatearNumero(valor, Number.isInteger(valor) ? 0 : 1);
}

/** Fracción del motor (0,15) como porcentaje («15 %»). */
export function porcentaje(fraccion: number): string {
  return `${formatearNumero(fraccion * 100)} %`;
}

export function unidadCarga(unidad: Unidad): string {
  return unidad === 'EV' ? 'EV/ha' : 'kg MS/ha';
}
