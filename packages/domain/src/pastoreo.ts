// Cálculo de una fila de la Planilla de Pastoreo CREA Utracán.
import type { FechaISO, Lote, Pastoreo, Rodeo } from './tipos';

const MS_POR_DIA = 86_400_000;

/** Eficiencia de cosecha por defecto de la planilla CREA. */
export const EFICIENCIA_COSECHA = 0.5;

const aUTC = (fecha: FechaISO): number => {
  const [a, m, d] = fecha.split('-').map(Number);
  return Date.UTC(a!, m! - 1, d!);
};

/** Días de pastoreo. La fecha de salida no se cuenta: del 1/4 al 10/4 son 9 días. */
export function diasEntre(entrada: FechaISO, salida: FechaISO): number {
  return Math.round((aUTC(salida) - aUTC(entrada)) / MS_POR_DIA);
}

/** EV por cabeza: factor de la categoría × (peso vivo / 400)^0,75.
 *
 * @deprecated No reproduce la planilla CREA. Usar calcularCampana (motor/). Se quita cuando BFC-26 y BFC-29 migren las pantallas.
 */
export function evPorCabeza(r: Pick<Rodeo, 'factorEv' | 'pesoVivo'>): number {
  return r.factorEv * Math.pow(r.pesoVivo / 400, 0.75);
}

export interface EntradaPastoreo {
  lote: Pick<Lote, 'hectareas'>;
  rodeo: Pick<Rodeo, 'factorEv' | 'pesoVivo' | 'pctPesoVivoMS'>;
  cabezas: number;
  entrada: FechaISO;
  salida: FechaISO;
  eficienciaCosecha?: number;
}

export interface ResultadoPastoreo {
  valido: true;
  dias: number;
  evPorCabeza: number;
  evTotales: number;
  /** EV totales × días. */
  raciones: number;
  racionesPorHa: number;
  /** EV/ha. */
  carga: number;
  /** kg MS/día. */
  consumoMS: number;
  /** kg MS/día que tiene que ofrecer el lote. */
  ofertaMS: number;
  /** kg MS en todo el período. */
  ofertaPeriodo: number;
}

export type CalculoPastoreo = ResultadoPastoreo | { valido: false; motivo: 'fechas-invalidas' };

/**
 * Cálculo simplificado de una fila de la planilla.
 *
 * @deprecated No reproduce la planilla CREA. Usar calcularCampana (motor/). Se quita cuando BFC-26 y BFC-29 migren las pantallas.
 */
export function calcularPastoreo(e: EntradaPastoreo): CalculoPastoreo {
  if (!e.entrada || !e.salida) return { valido: false, motivo: 'fechas-invalidas' };
  const dias = diasEntre(e.entrada, e.salida);
  if (!(dias > 0)) return { valido: false, motivo: 'fechas-invalidas' };

  const evCab = evPorCabeza(e.rodeo);
  const evTotales = evCab * e.cabezas;
  const raciones = evTotales * dias;
  const consumoMS = (e.rodeo.pesoVivo * e.rodeo.pctPesoVivoMS * e.cabezas) / 100;
  const ofertaMS = consumoMS / (e.eficienciaCosecha ?? EFICIENCIA_COSECHA);

  return {
    valido: true,
    dias,
    evPorCabeza: evCab,
    evTotales,
    raciones,
    racionesPorHa: raciones / e.lote.hectareas,
    carga: evTotales / e.lote.hectareas,
    consumoMS,
    ofertaMS,
    ofertaPeriodo: ofertaMS * dias,
  };
}

/**
 * Pastoreo del mismo rodeo en otro lote que todavía no terminó en la fecha de
 * entrada (puede entrar el mismo día que sale del otro lote).
 */
export function buscarSuperposicion(
  pastoreos: readonly Pastoreo[],
  nuevo: { rodeoId: string; loteId: number; entrada: FechaISO },
): Pastoreo | null {
  if (!nuevo.entrada) return null;
  return (
    pastoreos.find(
      (p) =>
        p.rodeoId === nuevo.rodeoId &&
        p.loteId !== nuevo.loteId &&
        p.entrada <= nuevo.entrada &&
        nuevo.entrada < p.salida,
    ) ?? null
  );
}
