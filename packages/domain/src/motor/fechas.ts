// Aritmética de fechas de la planilla: días enteros desde la época, en UTC.
import type { FechaISO } from '../tipos';

const MS_POR_DIA = 86400000;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

/** "2026-03-01" → días desde la época. Null si falta o está mal formada. */
export function diaDe(f: FechaISO | null): number | null {
  if (!f) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f);
  return m ? Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!) / MS_POR_DIA : null;
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
  return Date.UTC(p.a, p.m - 1, 1) / MS_POR_DIA;
}

/** Primer día del mes `n` meses después de `diaInicioMes` (n puede ser negativo). */
export function sumarMeses(diaInicioMes: number, n: number): number {
  const p = partes(diaInicioMes);
  return Date.UTC(p.a, p.m - 1 + n, 1) / MS_POR_DIA;
}

export function diasDelMes(a: number, m: number): number {
  return (Date.UTC(a, m, 1) - Date.UTC(a, m - 1, 1)) / MS_POR_DIA;
}

/** Columna MES de la planilla: «abril 2026» o «mar a may 2026». La salida no se cuenta. */
export function etiquetaMes(entrada: number, salida: number | null): string {
  const a = partes(entrada);
  if (salida == null) return `${MESES[a.m - 1]} ${a.a}`;
  const h = partes(salida - 1);
  if (a.a === h.a && a.m === h.m) return `${MESES[a.m - 1]} ${a.a}`;
  return `${MESES_CORTOS[a.m - 1]} a ${MESES_CORTOS[h.m - 1]} ${h.a}`;
}

/** Mes del ciclo (1 a 12) de un mes calendario: MOD(mes − servicio + 3; 12) + 1. */
export function mesDelCiclo(mesCalendario: number, mesServicio: number): number {
  return ((((mesCalendario - mesServicio + 3) % 12) + 12) % 12) + 1;
}
