// Resultados de la campaña por mes, lote y rodeo, en EV o en kg MS (pestañas Resultados de la planilla).
// Traducción 1 a 1 de `resultados` del Engine de la planilla. La planilla agrupa por nombre; acá, por id.
import { diaDe, diasDelAnio, fechaDe, inicioMes, partes, sumarMeses } from './fechas';
import type { Contexto } from './fila';
import { esNumero } from './numeros';
import type {
  FilaCalculada, IndicadoresFila, ResultadoLote, ResultadoMes, ResultadoRodeo, ResultadosCampana,
} from './tipos';

const orden = new Intl.Collator('es', { sensitivity: 'base' });
const SIN_RODEO = '(sin rodeo)';

/** Indicadores de una fila en una unidad, con 0 donde no hay número. */
interface Valores {
  /** EV o kg MS totales por día. */
  totales: number;
  raciones: number;
  racionesPorHa: number;
  racionesNumericas: boolean;
}

/**
 * Un pastoreo con lo que necesitan los resultados. `ok` = completo: entrada, salida posterior y lote.
 * Un lote o rodeo cuyo id no existe en la campaña cuenta como faltante (null).
 */
interface Registro {
  ok: boolean;
  entrada: number | null;
  salida: number | null;
  loteId: string | null;
  rodeoId: string | null;
  cabezas: number;
  ev: Valores;
  ms: Valores;
  /** Días del pastoreo en cada mes de `meses` (solo para los completos). */
  dias: number[];
}

interface CoberturaLote {
  loteId: string;
  hectareas: number;
  /** Pastoreos completos del lote. */
  mios: Registro[];
  diasPorMes: number[];
  dias: number;
}

/** Lo que no depende de la unidad: se arma una vez y sirve para EV y para MS. */
export interface BaseResultados {
  ctx: Contexto;
  registros: Registro[];
  completos: Registro[];
  diasAnio: number;
  /** Primer día de cada mes con pastoreo, y el primer día del mes siguiente. */
  meses: number[];
  finMes: number[];
  lotes: CoberturaLote[];
  rodeos: ResultadoRodeo[];
}

function valores(u: IndicadoresFila): Valores {
  return {
    totales: esNumero(u.totales) ? u.totales : 0,
    raciones: esNumero(u.raciones) ? u.raciones : 0,
    racionesPorHa: esNumero(u.racionesPorHa) ? u.racionesPorHa : 0,
    racionesNumericas: esNumero(u.raciones),
  };
}

/** Arma la base de los resultados. `filas` son las de `ctx.campana.pastoreos`, en el mismo orden; si no, tira error. */
export function prepararResultados(filas: readonly FilaCalculada[], ctx: Contexto): BaseResultados {
  const { pastoreos } = ctx.campana;
  const desalineadas = (): Error => new Error('Las filas no corresponden a los pastoreos de la campaña, en el mismo orden.');
  if (filas.length !== pastoreos.length) throw desalineadas();
  const registros = filas.map((f, i): Registro => {
    const p = pastoreos[i]!;
    if (f.pastoreoId !== p.id) throw desalineadas();
    const entrada = diaDe(p.entrada);
    const salida = diaDe(p.salida);
    const loteId = p.loteId && ctx.lotes.has(p.loteId) ? p.loteId : null;
    const rodeoId = p.rodeoId && ctx.rodeos.has(p.rodeoId) ? p.rodeoId : null;
    return {
      ok: entrada != null && salida != null && salida > entrada && loteId != null,
      entrada, salida, loteId, rodeoId,
      cabezas: esNumero(f.cabezas) ? f.cabezas : 0,
      ev: valores(f.ev),
      ms: valores(f.ms),
      dias: [],
    };
  });

  // Rareza de la planilla: el año sale de la entrada más temprana con lote, aunque la fila no esté completa.
  let primera = Infinity;
  for (const r of registros) if (r.entrada != null && r.loteId != null && r.entrada < primera) primera = r.entrada;
  const diasAnio = primera !== Infinity ? diasDelAnio(partes(primera).a) : 365;

  const completos = registros.filter((r) => r.ok);
  const base: BaseResultados = { ctx, registros, completos, diasAnio, meses: [], finMes: [], lotes: [], rodeos: [] };
  if (!completos.length) return base;

  let mn = Infinity, mx = -Infinity;
  for (const r of completos) {
    if (r.entrada! < mn) mn = r.entrada!;
    if (r.salida! > mx) mx = r.salida!;
  }
  const meses: number[] = [];
  for (let m = inicioMes(mn), ultimo = inicioMes(mx - 1); m <= ultimo; m = sumarMeses(m, 1)) meses.push(m);
  const finMes = meses.map((m) => sumarMeses(m, 1));
  for (const r of completos) {
    r.dias = meses.map((m, k) => Math.max(Math.min(r.salida!, finMes[k]!) - Math.max(r.entrada!, m), 0));
  }

  // Lotes, en orden de primera aparición y después por nombre (sort estable, como el Engine).
  const idsLote: string[] = [];
  for (const r of completos) if (!idsLote.includes(r.loteId!)) idsLote.push(r.loteId!);
  const nombreLote = (id: string): string => ctx.lotes.get(id)!.nombre;
  idsLote.sort((a, b) => orden.compare(nombreLote(a), nombreLote(b)));
  const lotes = idsLote.map((loteId): CoberturaLote => {
    const mios = completos.filter((r) => r.loteId === loteId);
    // Cobertura por día: dos pastoreos superpuestos no cuentan dos veces el mismo día.
    const cubierto = new Uint8Array(mx - mn);
    for (const r of mios) for (let d = r.entrada!; d < r.salida!; d++) cubierto[d - mn] = 1;
    const diasPorMes = meses.map((m, k) => {
      let c = 0;
      for (let d = Math.max(m, mn), fin = Math.min(finMes[k]!, mx); d < fin; d++) c += cubierto[d - mn]!;
      return c;
    });
    const ha = ctx.lotes.get(loteId)!.hectareas;
    return { loteId, hectareas: esNumero(ha) ? ha : 0, mios, diasPorMes, dias: diasPorMes.reduce((s, v) => s + v, 0) };
  });

  // Rodeos; los pastoreos sin rodeo forman un grupo que ordena como «(sin rodeo)».
  const idsRodeo: (string | null)[] = [];
  for (const r of completos) if (!idsRodeo.includes(r.rodeoId)) idsRodeo.push(r.rodeoId);
  const nombreRodeo = (id: string | null): string => (id == null ? SIN_RODEO : ctx.rodeos.get(id)!.nombre);
  idsRodeo.sort((a, b) => orden.compare(nombreRodeo(a), nombreRodeo(b)));
  const rodeos = idsRodeo.map((rodeoId): ResultadoRodeo => ({
    rodeoId,
    categoria: rodeoId == null ? null : ctx.rodeos.get(rodeoId)!.categoria,
    // Cabezas presentes el primer día de cada mes.
    cabezasPorMes: meses.map((m) => completos.reduce(
      (s, r) => s + (r.rodeoId === rodeoId && r.entrada! <= m && m < r.salida! ? r.cabezas : 0), 0)),
  }));

  return { ...base, meses, finMes, lotes, rodeos };
}

/**
 * Resultados de la campaña en una unidad, a partir de la base.
 * Solo cuentan los pastoreos completos; sin ninguno, `hayDatos` es false y las listas quedan vacías.
 */
export function resultadosEn(base: BaseResultados, unidad: 'EV' | 'MS'): ResultadosCampana {
  const { ctx, registros, completos, diasAnio, meses, finMes } = base;
  const R: ResultadosCampana = {
    unidad, hayDatos: completos.length > 0, meses: meses.map(fechaDe), diasAnio, superficieTotal: ctx.superficieTotal,
    eficienciaCosecha: ctx.eficiencia, porMes: [], lotes: [], rodeos: base.rodeos, cargaAnual: 0, racionesTotales: 0,
  };
  if (!R.hayDatos) return R;
  const efic = ctx.eficiencia / 100;
  const v = (r: Registro): Valores => (unidad === 'MS' ? r.ms : r.ev);

  const racionesPorMes = (rs: readonly Registro[]): number[] =>
    meses.map((_, k) => rs.reduce((s, r) => s + v(r).totales * r.dias[k]!, 0));
  const racMes = racionesPorMes(completos);
  R.porMes = meses.map((m, k): ResultadoMes => {
    const promedio = racMes[k]! / (finMes[k]! - m);
    return {
      mes: fechaDe(m), promedio, carga: ctx.superficieTotal ? promedio / ctx.superficieTotal : null,
      raciones: racMes[k]!, oferta: racMes[k]! / efic,
    };
  });
  R.racionesTotales = completos.reduce((s, r) => s + v(r).raciones, 0);
  R.cargaAnual = ctx.superficieTotal
    ? completos.reduce((s, r) => s + v(r).totales * (r.salida! - r.entrada!), 0) / (ctx.superficieTotal * diasAnio)
    : 0;

  R.lotes = base.lotes.map(({ loteId, hectareas, mios, diasPorMes, dias }): ResultadoLote => {
    const evDias = mios.reduce((s, r) => s + v(r).totales * (r.salida! - r.entrada!), 0);
    const q = evDias / (hectareas * dias);
    const racionesPorHa = mios.reduce((s, r) => s + v(r).racionesPorHa, 0);
    const raciones = mios.reduce((s, r) => s + v(r).raciones, 0);
    const racionesMes = racionesPorMes(mios);
    // Rareza de la planilla: cuenta todas las filas del lote con raciones numéricas, aunque no estén completas.
    const pastoreos = registros.filter((r) => r.loteId === loteId && v(r).racionesNumericas).length;
    return {
      loteId, hectareas, diasPorMes, dias,
      diasLibres: diasAnio - dias,
      ocupacion: dias / diasAnio,
      carga: Number.isFinite(q) ? q : 0,
      raciones, racionesPorHa, racionesPorMes: racionesMes,
      oferta: raciones / efic, ofertaPorHa: racionesPorHa / efic, ofertaPorMes: racionesMes.map((x) => x / efic),
      pastoreos,
      racionesPromedio: pastoreos ? raciones / pastoreos : 0,
      racionesPorHaPromedio: pastoreos ? racionesPorHa / pastoreos : 0,
    };
  });
  return R;
}

/** Resultados en una unidad. `filas` son las de `ctx.campana.pastoreos`, en el mismo orden; si no, tira error. */
export function calcularResultados(filas: readonly FilaCalculada[], ctx: Contexto, unidad: 'EV' | 'MS'): ResultadosCampana {
  return resultadosEn(prepararResultados(filas, ctx), unidad);
}
