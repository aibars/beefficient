// Aritmética de fechas de la planilla: días enteros desde la época, en UTC.
import type { FechaISO } from '../tipos';

const MS_POR_DIA = 86400000;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

/** Días desde la época de un año, mes (1 a 12) y día; desborda como `Date.UTC`. */
export function diaUTC(a: number, m: number, d: number): number {
  return Date.UTC(a, m - 1, d) / MS_POR_DIA;
}

/** "2026-03-01" → días desde la época. Null si falta, está mal formada o no existe ("2026-02-30"). */
export function diaDe(f: FechaISO | null): number | null {
  if (!f) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f);
  if (!m) return null;
  const a = +m[1]!, mes = +m[2]!, d = +m[3]!;
  const dia = diaUTC(a, mes, d);
  const p = partes(dia);
  return p.a === a && p.m === mes && p.d === d ? dia : null;
}

/** Inversa de `diaDe`. */
export function fechaDe(dia: number): FechaISO {
  const t = new Date(dia * MS_POR_DIA);
  const mes = String(t.getUTCMonth() + 1).padStart(2, '0');
  const diaDelMes = String(t.getUTCDate()).padStart(2, '0');
  return `${t.getUTCFullYear()}-${mes}-${diaDelMes}`;
}

/** Año, mes (1 a 12) y día del mes de un día. */
export function partes(dia: number): { a: number; m: number; d: number } {
  const t = new Date(dia * MS_POR_DIA);
  return { a: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

/** Primer día del mes que contiene `dia`. */
export function inicioMes(dia: number): number {
  const p = partes(dia);
  return diaUTC(p.a, p.m, 1);
}

/** Primer día del mes `n` meses después de `diaInicioMes` (n puede ser negativo). */
export function sumarMeses(diaInicioMes: number, n: number): number {
  const p = partes(diaInicioMes);
  return diaUTC(p.a, p.m + n, 1);
}

export function diasDelAnio(a: number): number {
  return diaUTC(a + 1, 1, 1) - diaUTC(a, 1, 1);
}

/**
 * Columna MES de la planilla: «abril 2026» o «mar a may 2026». La salida no se cuenta.
 * Sin salida, o con salida ≤ entrada, el mes de la entrada (la planilla da un rango al revés).
 */
export function etiquetaMes(entrada: number, salida: number | null): string {
  const a = partes(entrada);
  const h = salida == null || salida <= entrada ? a : partes(salida - 1);
  if (a.a === h.a && a.m === h.m) return `${MESES[a.m - 1]} ${a.a}`;
  return `${MESES_CORTOS[a.m - 1]} a ${MESES_CORTOS[h.m - 1]} ${h.a}`;
}

/** Mes del ciclo (1 a 12) de un mes calendario: MOD(mes − servicio + 3; 12) + 1. */
export function mesDelCiclo(mesCalendario: number, mesServicio: number): number {
  return ((((mesCalendario - mesServicio + 3) % 12) + 12) % 12) + 1;
}
