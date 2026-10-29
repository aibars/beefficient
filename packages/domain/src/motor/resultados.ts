// Resultados de la campaña por mes, lote y rodeo, en EV o en kg MS (pestañas Resultados de la planilla).
// Traducción 1 a 1 de `resultados` del Engine de la planilla. La planilla agrupa por nombre; acá, por id.
import { diaDe, fechaDe, inicioMes, partes, sumarMeses } from './fechas';
import type { Contexto } from './fila';
import type { FilaCalculada, ResultadoLote, ResultadoMes, ResultadoRodeo, ResultadosCampana } from './tipos';

function esNumero(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

const orden = new Intl.Collator('es', { sensitivity: 'base' });
const SIN_RODEO = '(sin rodeo)';

/**
 * Nombre con que se ordena un lote o rodeo cuyo id no existe en la campaña. No tiene nombre propio;
 * ordena como «?id», el nombre con que los tests de fidelidad se lo pasan al Engine.
 */
const nombreDesconocido = (id: string): string => `?${id}`;

/** Un pastoreo con lo que necesitan los resultados. `ok` = completo: entrada, salida posterior y lote. */
interface Registro {
  ok: boolean;
  entrada: number | null;
  salida: number | null;
  loteId: string | null;
  rodeoId: string | null;
  /** EV o kg MS totales por día (0 si no hay). */
  totales: number;
  cabezas: number;
  raciones: number;
  racionesPorHa: number;
  racionesNumericas: boolean;
  /** Días del pastoreo en cada mes de `meses` (solo para los completos). */
  dias: number[];
}

/**
 * Resultados de la campaña en una unidad. `filas` viene en el mismo orden que `ctx.campana.pastoreos`.
 * Solo cuentan los pastoreos completos; sin ninguno, `hayDatos` es false y las listas quedan vacías.
 */
export function calcularResultados(filas: readonly FilaCalculada[], ctx: Contexto, unidad: 'EV' | 'MS'): ResultadosCampana {
  const R: ResultadosCampana = {
    unidad, hayDatos: false, meses: [], diasAnio: 365, superficieTotal: ctx.superficieTotal,
    eficienciaCosecha: ctx.eficiencia, porMes: [], lotes: [], rodeos: [], cargaAnual: 0, racionesTotales: 0,
  };
  const efic = ctx.eficiencia / 100;

  const registros: Registro[] = filas.map((f, i) => {
    const p = ctx.campana.pastoreos[i];
    const entrada = diaDe(p?.entrada ?? null);
    const salida = diaDe(p?.salida ?? null);
    const loteId = p?.loteId || null;
    const u = unidad === 'MS' ? f.ms : f.ev;
    return {
      ok: entrada != null && salida != null && salida > entrada && loteId != null,
      entrada, salida, loteId, rodeoId: p?.rodeoId || null,
      totales: esNumero(u.totales) ? u.totales : 0,
      cabezas: esNumero(f.cabezas) ? f.cabezas : 0,
      raciones: esNumero(u.raciones) ? u.raciones : 0,
      racionesPorHa: esNumero(u.racionesPorHa) ? u.racionesPorHa : 0,
      racionesNumericas: esNumero(u.raciones),
      dias: [],
    };
  });

  // Rareza de la planilla: el año sale de la entrada más temprana con lote, aunque la fila no esté completa.
  let primera = Infinity;
  for (const r of registros) if (r.entrada != null && r.loteId != null && r.entrada < primera) primera = r.entrada;
  if (primera !== Infinity) {
    const a = partes(primera).a;
    R.diasAnio = (Date.UTC(a + 1, 0, 1) - Date.UTC(a, 0, 1)) / 86400000;
  }

  const completos = registros.filter((r) => r.ok);
  if (!completos.length) return R;
  R.hayDatos = true;

  let mn = Infinity, mx = -Infinity;
  for (const r of completos) {
    if (r.entrada! < mn) mn = r.entrada!;
    if (r.salida! > mx) mx = r.salida!;
  }
  const meses: number[] = [];
  for (let m = inicioMes(mn), ultimo = inicioMes(mx - 1); m <= ultimo; m = sumarMeses(m, 1)) meses.push(m);
  const finMes = meses.map((m) => sumarMeses(m, 1));
  R.meses = meses.map(fechaDe);
  for (const r of completos) {
    r.dias = meses.map((m, k) => Math.max(Math.min(r.salida!, finMes[k]!) - Math.max(r.entrada!, m), 0));
  }

  const racionesPorMes = (rs: readonly Registro[]): number[] =>
    meses.map((_, k) => rs.reduce((s, r) => s + r.totales * r.dias[k]!, 0));
  const racMes = racionesPorMes(completos);
  R.porMes = meses.map((m, k): ResultadoMes => {
    let evDias = 0;
    for (const r of completos) evDias += r.dias[k]! * r.totales;
    const promedio = evDias / (finMes[k]! - m);
    return {
      mes: fechaDe(m), promedio, carga: ctx.superficieTotal ? promedio / ctx.superficieTotal : null,
      raciones: racMes[k]!, oferta: racMes[k]! / efic,
    };
  });
  R.racionesTotales = completos.reduce((s, r) => s + r.raciones, 0);
  R.cargaAnual = ctx.superficieTotal
    ? completos.reduce((s, r) => s + r.totales * (r.salida! - r.entrada!), 0) / (ctx.superficieTotal * R.diasAnio)
    : 0;

  // Lotes, en orden de primera aparición y después por nombre (sort estable, como el Engine).
  const idsLote: string[] = [];
  for (const r of completos) if (!idsLote.includes(r.loteId!)) idsLote.push(r.loteId!);
  const nombreLote = (id: string): string => ctx.lotes.get(id)?.nombre ?? nombreDesconocido(id);
  idsLote.sort((a, b) => orden.compare(nombreLote(a), nombreLote(b)));
  R.lotes = idsLote.map((loteId): ResultadoLote => {
    const mios = completos.filter((r) => r.loteId === loteId);
    // Cobertura por día: dos pastoreos superpuestos no cuentan dos veces el mismo día.
    const cubierto = new Uint8Array(mx - mn);
    for (const r of mios) for (let d = r.entrada!; d < r.salida!; d++) cubierto[d - mn] = 1;
    const diasPorMes = meses.map((m, k) => {
      let c = 0;
      for (let d = Math.max(m, mn), fin = Math.min(finMes[k]!, mx); d < fin; d++) c += cubierto[d - mn]!;
      return c;
    });
    const dias = diasPorMes.reduce((s, v) => s + v, 0);
    const evDias = mios.reduce((s, r) => s + r.totales * (r.salida! - r.entrada!), 0);
    const ha = ctx.lotes.get(loteId)?.hectareas;
    const hectareas = esNumero(ha) ? ha : 0;
    const q = evDias / (hectareas * dias);
    const racionesPorHa = mios.reduce((s, r) => s + r.racionesPorHa, 0);
    const raciones = mios.reduce((s, r) => s + r.raciones, 0);
    const racionesMes = racionesPorMes(mios);
    // Rareza de la planilla: cuenta todas las filas del lote con raciones numéricas, aunque no estén completas.
    const pastoreos = registros.filter((r) => r.loteId === loteId && r.racionesNumericas).length;
    return {
      loteId, hectareas, diasPorMes, dias,
      diasLibres: R.diasAnio - dias,
      ocupacion: dias / R.diasAnio,
      carga: Number.isFinite(q) ? q : 0,
      raciones, racionesPorHa, racionesPorMes: racionesMes,
      oferta: raciones / efic, ofertaPorHa: racionesPorHa / efic, ofertaPorMes: racionesMes.map((v) => v / efic),
      pastoreos,
      racionesPromedio: pastoreos ? raciones / pastoreos : 0,
      racionesPorHaPromedio: pastoreos ? racionesPorHa / pastoreos : 0,
    };
  });

  // Rodeos; los pastoreos sin rodeo forman un grupo que ordena como «(sin rodeo)».
  const idsRodeo: (string | null)[] = [];
  for (const r of completos) if (!idsRodeo.includes(r.rodeoId)) idsRodeo.push(r.rodeoId);
  const nombreRodeo = (id: string | null): string =>
    id == null ? SIN_RODEO : ctx.rodeos.get(id)?.nombre ?? nombreDesconocido(id);
  idsRodeo.sort((a, b) => orden.compare(nombreRodeo(a), nombreRodeo(b)));
  R.rodeos = idsRodeo.map((rodeoId): ResultadoRodeo => ({
    rodeoId,
    categoria: rodeoId == null ? null : ctx.rodeos.get(rodeoId)?.categoria ?? null,
    // Cabezas presentes el primer día de cada mes.
    cabezasPorMes: meses.map((m) => completos.reduce(
      (s, r) => s + (r.rodeoId === rodeoId && r.entrada! <= m && m < r.salida! ? r.cabezas : 0), 0)),
  }));
  return R;
}
