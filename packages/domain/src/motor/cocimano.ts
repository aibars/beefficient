// Cocimano: EV por peso, ganancia y estado fisiológico. Traducción 1 a 1 del Engine de la planilla.
import { diaDe, sumarMeses } from './fechas';
import { COCIMANO, COCIMANO_GANANCIAS, DURACIONES_SERVICIO, COCIMANO_PESOS, COCIMANO_VAQ, COCIMANO_VAQ_PESOS } from './tablas';
import type { Advertencia, Campana, GrupoConsumo, RodeoCampana, Supuestos } from './tipos';

const DIA_MS = 86400000;

function esNumero(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function interpolar(xs: readonly number[], ys: readonly number[], x: number): number {
  const n = xs.length;
  if (x <= xs[0]!) return ys[0]!;
  if (x >= xs[n - 1]!) return ys[n - 1]!;
  let i = 0;
  while (x > xs[i + 1]!) i++;
  return ys[i]! + (ys[i + 1]! - ys[i]!) * (x - xs[i]!) / (xs[i + 1]! - xs[i]!);
}

/**
 * EV de la tabla para un peso, una ganancia diaria (g/día) y una columna (0 a 8).
 * Fuera de rango de ganancia la recorta; fuera de rango de peso extrapola hasta el margen.
 */
export function evCocimano(
  pesoVivo: number,
  ganancia: number | null,
  columna: number,
  margenExtrapolacion: number,
): { ev: number; advertencias: Advertencia[]; pesoUsado: number; ganancia: number } {
  const advertencias: Advertencia[] = [];
  const gMin = COCIMANO_GANANCIAS[0];
  const gMax = COCIMANO_GANANCIAS[COCIMANO_GANANCIAS.length - 1]!;
  let g = esNumero(ganancia) ? ganancia : 0;
  if (g < gMin) { g = gMin; advertencias.push('gan'); }
  if (g > gMax) { g = gMax; advertencias.push('gan'); }
  const pesos: readonly number[] = columna === 4 ? [...COCIMANO_VAQ_PESOS, ...COCIMANO_PESOS] : COCIMANO_PESOS;
  const evEn = (p: number): number => {
    const ys = p < 300
      ? COCIMANO_VAQ[p as 150 | 200 | 250].slice(0, 6)
      : COCIMANO[p as 300 | 350 | 400 | 450 | 500 | 550].map((fila) => fila[columna]!);
    return interpolar(COCIMANO_GANANCIAS, ys, g);
  };
  const min = pesos[0]!;
  const max = pesos[pesos.length - 1]!;
  let pp = pesoVivo;
  if (pesoVivo < min) {
    if (pesoVivo < min - margenExtrapolacion) { pp = min - margenExtrapolacion; advertencias.push('fuera'); }
    else advertencias.push('extrap');
  } else if (pesoVivo > max) {
    if (pesoVivo > max + margenExtrapolacion) { pp = max + margenExtrapolacion; advertencias.push('fuera'); }
    else advertencias.push('extrap');
  }
  let i = 0;
  while (i < pesos.length - 2 && pp > pesos[i + 1]!) i++;
  const p0 = pesos[i]!;
  const p1 = pesos[i + 1]!;
  const e0 = evEn(p0);
  const e1 = evEn(p1);
  return { ev: e0 + (e1 - e0) * (pp - p0) / (p1 - p0), advertencias, pesoUsado: pp, ganancia: g };
}

type TipoHembra = 'vaca' | 'vaq2' | 'vaq1';

function tipoHembra(categoria: string | null): TipoHembra | null {
  const c = (categoria ?? '').toLocaleLowerCase('es');
  if (c === 'vaca' || c === 'vaquillona 2do servicio') return 'vaca';
  if (c === 'vaquillona 1er servicio') return 'vaq2';
  if (c === 'vaquillona de reposición') return 'vaq1';
  return null;
}

interface ParamsRodeo { tipo: TipoHembra; C: number; P: number; W: number; sup: Supuestos }

/** Parámetros de la vaca promedio del rodeo. */
function paramsRodeo(
  rodeo: RodeoCampana,
  campana: Pick<Campana, 'anio' | 'mesServicio'>,
  sup: Supuestos,
): ParamsRodeo | null {
  const tipo = tipoHembra(rodeo.categoria);
  if (!tipo) return null;
  const sRodeo = diaDe(rodeo.inicioServicio);
  const S = sRodeo != null ? sRodeo : Date.UTC(campana.anio, campana.mesServicio - 1, 1) / DIA_MS;
  const D = DURACIONES_SERVICIO.includes(rodeo.duracionServicio) ? rodeo.duracionServicio : 90;
  const C = S + Math.round(sup.fraccionServicio * D); // concepción media
  const P = C + sup.gestacion; // parto de la vaca promedio
  const wDef = sumarMeses(S, 4); // fin del mes 7 del ciclo (mes de servicio + 3)
  const wRodeo = diaDe(rodeo.destete);
  const W = wRodeo != null ? wRodeo : wDef;
  return { tipo, C, P, W, sup };
}

type EstadoFisiologico = 'vaq' | 'lact' | 'gest' | 'seca';

function estadoEn(pr: ParamsRodeo, T: number): { st: EstadoFisiologico; col: number } {
  const per = 365;
  const dm = pr.sup.diasPorMes;
  if (pr.tipo === 'vaq1') return { st: 'vaq', col: 4 };
  if (pr.tipo === 'vaq2' && T < pr.C) return { st: 'vaq', col: 4 };
  const Pk = pr.P + per * Math.floor((T - pr.P) / per); // último parto (<= T)
  let lact = false;
  let lm = 0;
  if (pr.tipo === 'vaca' || T >= pr.P) {
    let Wk = pr.W + per * Math.floor((Pk - pr.W) / per);
    while (Wk <= Pk) Wk += per; // destete del ciclo que empezó en Pk
    lm = Math.floor((T - Pk) / dm) + 1;
    lact = T < Wk;
  }
  if (lact) return { st: 'lact', col: Math.min(3, Math.ceil(lm / 2) - 1) };
  const Ck = pr.C + per * Math.floor((T - pr.C) / per); // última concepción (<= T)
  const gm = Math.floor((T - Ck) / dm) + 1;
  if (gm >= 6) return { st: 'gest', col: 4 + Math.min(gm, 9) - 5 };
  return { st: pr.tipo === 'vaq2' ? 'vaq' : 'seca', col: 4 };
}

/** Un rodeo usa Cocimano si no lo apagaron, tiene peso vivo y es una categoría de hembra. */
export function usaCocimano(rodeo: RodeoCampana | undefined): rodeo is RodeoCampana {
  return !!rodeo && rodeo.usaCocimano !== false && esNumero(rodeo.pesoVivo) && !!tipoHembra(rodeo.categoria);
}

/** EV de un rodeo en un mes calendario, evaluado el día 15. Null si no es hembra o no tiene peso. */
export function evDelMes(
  rodeo: RodeoCampana,
  campana: Pick<Campana, 'anio' | 'mesServicio'>,
  supuestos: Supuestos,
  anio: number,
  mes: number,
): { ev: number; advertencias: Advertencia[]; grupo: GrupoConsumo } | null {
  const pr = paramsRodeo(rodeo, campana, supuestos);
  if (!pr || !esNumero(rodeo.pesoVivo)) return null;
  const T = Date.UTC(anio, mes - 1, 15) / DIA_MS;
  const e = estadoEn(pr, T);
  const gMes = rodeo.ganancia[mes - 1];
  const g = esNumero(gMes) ? gMes : 0;
  const r = evCocimano(rodeo.pesoVivo, g, e.col, supuestos.margenExtrapolacion);
  const grupo: GrupoConsumo = e.st === 'lact' ? 'lact' : e.st === 'gest' ? 'gest' : e.st === 'seca' ? 'seca' : (pr.tipo === 'vaq1' ? 'vaq1' : 'vaq2');
  return { ev: r.ev, advertencias: r.advertencias, grupo };
}
