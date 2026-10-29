// Una fila de la Planilla de Pastoreo (columnas B, D, F, I a N y su equivalente en kg MS).
// Traducción de `vigente`, `contexto`, `msKeyCat` y `calcRow` del Engine de la planilla; las diferencias están en CalculoDePastoreo.mdx.
import { evDelMesCon, paramsRodeo, usaCocimano, type ParamsRodeo } from './cocimano';
import { diaDe, etiquetaMes, inicioMes, mesDelCiclo, partes, sumarMeses } from './fechas';
import { esNumero } from './numeros';
import { CONSUMO_POR_DEFECTO, EFICIENCIA_COSECHA_POR_DEFECTO, SUPUESTOS_POR_DEFECTO, TABLA_1 } from './tablas';
import type {
  Advertencia, Campana, ConsumoGrupo, FilaCalculada, FilaTabla1, GrupoConsumo,
  LoteCampana, PastoreoCampana, PorMes, RodeoCampana, Supuestos,
} from './tipos';

/** Datos de la campaña ya resueltos, compartidos por todas las filas. */
export interface Contexto {
  /** La campaña con `mesServicio` ya normalizado. */
  campana: Campana;
  supuestos: Supuestos;
  consumo: Readonly<Record<GrupoConsumo, ConsumoGrupo>>;
  tabla1: readonly FilaTabla1[];
  /** Tabla 3: EV vigente por mes calendario (enero a diciembre) de cada fila de la Tabla 1, por id. */
  vigente: Map<string, PorMes<number | null>>;
  lotes: Map<string, LoteCampana>;
  rodeos: Map<string, RodeoCampana>;
  /** Parámetros de Cocimano de cada rodeo, por id; null si no es una categoría de hembra. */
  paramsRodeo: Map<string, ParamsRodeo | null>;
  /** Suma de las hectáreas de todos los lotes; un lote sin hectáreas suma 0. */
  superficieTotal: number;
  /** Eficiencia de cosecha en %; fuera de [1, 100] vale 50. */
  eficiencia: number;
}

/** EV vigente por mes calendario: el ajuste manual si lo hay; si no, el EV del mes del ciclo. */
function vigenteDe(fila: FilaTabla1, mesServicio: number): (number | null)[] {
  const out: (number | null)[] = [];
  for (let c = 1; c <= 12; c++) {
    const ajuste = fila.ajustes[c - 1];
    if (esNumero(ajuste)) out.push(ajuste);
    else {
      const v = fila.ev[mesDelCiclo(c, mesServicio) - 1];
      out.push(esNumero(v) ? v : null);
    }
  }
  return out;
}

/** Arma el contexto de cálculo aplicando los valores por defecto de la planilla. */
export function crearContexto(dada: Campana): Contexto {
  // Como normCamp: el mes de servicio se redondea y, fuera de 1 a 12, vale 1.
  const ms = Math.round(dada.mesServicio);
  const campana: Campana = { ...dada, mesServicio: ms >= 1 && ms <= 12 ? ms : 1 };
  const supuestos: Supuestos = { ...SUPUESTOS_POR_DEFECTO };
  for (const k of Object.keys(SUPUESTOS_POR_DEFECTO) as (keyof Supuestos)[]) {
    const v = campana.supuestos?.[k];
    // diasPorMes ≤ 0 da NaN en Cocimano; la planilla no lo valida.
    if (esNumero(v) && (k !== 'diasPorMes' || v > 0)) supuestos[k] = v;
  }
  // Como normPvms: un peso o %PV que no es número toma el valor por defecto del grupo.
  const consumo = { ...CONSUMO_POR_DEFECTO };
  for (const k of Object.keys(CONSUMO_POR_DEFECTO) as GrupoConsumo[]) {
    const dado = campana.consumo?.[k];
    const def = CONSUMO_POR_DEFECTO[k];
    consumo[k] = {
      pesoVivo: esNumero(dado?.pesoVivo) ? dado.pesoVivo : def.pesoVivo,
      pct: esNumero(dado?.pct) ? dado.pct : def.pct,
    };
  }
  const tabla1 = campana.tabla1 ?? TABLA_1;
  const vigente = new Map<string, PorMes<number | null>>();
  for (const fila of tabla1) if (!vigente.has(fila.id)) vigente.set(fila.id, vigenteDe(fila, campana.mesServicio));
  const lotes = new Map<string, LoteCampana>();
  let superficieTotal = 0;
  for (const l of campana.lotes) {
    superficieTotal += esNumero(l.hectareas) ? l.hectareas : 0;
    if (!lotes.has(l.id)) lotes.set(l.id, l);
  }
  const rodeos = new Map<string, RodeoCampana>();
  for (const r of campana.rodeos) if (!rodeos.has(r.id)) rodeos.set(r.id, r);
  const params = new Map<string, ParamsRodeo | null>();
  for (const [id, r] of rodeos) params.set(id, paramsRodeo(r, campana, supuestos));
  // Es un porcentaje: una fracción como 0,5 queda fuera de rango y vale 50 (la planilla acepta (0, 100]).
  const ef = campana.eficienciaCosecha;
  return {
    campana,
    supuestos,
    consumo,
    tabla1,
    vigente,
    lotes,
    rodeos,
    paramsRodeo: params,
    superficieTotal,
    eficiencia: ef >= 1 && ef <= 100 ? ef : EFICIENCIA_COSECHA_POR_DEFECTO,
  };
}

/** Grupo de consumo de una fila de la Tabla 1 en un mes calendario; 'vaca' se resuelve por mes del ciclo. */
function grupoDeCategoria(fila: FilaTabla1, mes: number, mesServicio: number): GrupoConsumo {
  if (fila.grupoConsumo !== 'vaca') return fila.grupoConsumo;
  const c = mesDelCiclo(mes, mesServicio);
  return c <= 7 ? 'lact' : c <= 9 ? 'seca' : 'gest';
}

/** Calcula una fila de la planilla. Lo que en la planilla queda vacío, acá es null. */
export function calcularFila(pastoreo: PastoreoCampana, ctx: Contexto): FilaCalculada {
  const A = diaDe(pastoreo.entrada);
  const H = diaDe(pastoreo.salida);
  const lote = pastoreo.loteId ? ctx.lotes.get(pastoreo.loteId) : undefined;
  const D = lote ? (esNumero(lote.hectareas) ? lote.hectareas : 0) : null;
  const F = esNumero(pastoreo.cabezas) ? pastoreo.cabezas : null;

  let evAutomatico: number | null = null;
  let consumoPorCabeza: number | null = null;
  let fuenteEv: FilaCalculada['fuenteEv'] = null;
  let advertencias: Advertencia[] = [];
  const rodeo = pastoreo.rodeoId ? ctx.rodeos.get(pastoreo.rodeoId) : undefined;
  const cocimano = usaCocimano(rodeo);
  const idCategoria = pastoreo.categoriaTabla1Id;
  const evCategoria = idCategoria ? ctx.vigente.get(idCategoria) : undefined;
  const categoria = idCategoria ? ctx.tabla1.find((t) => t.id === idCategoria) : undefined;

  if (A != null && (cocimano || evCategoria)) {
    const n = H == null ? 0 : H - A;
    const fin = n <= 0 ? A + 1 : A + n;
    let sEv = 0, cEv = 0, sMs = 0, cMs = 0, d = A;
    const vistas = new Set<Advertencia>();
    while (d < fin) {
      const p = partes(d);
      const proximo = Math.min(fin, sumarMeses(inicioMes(d), 1));
      const dd = proximo - d;
      let ev: number | null = null;
      let grupo: GrupoConsumo | null = null;
      if (cocimano) {
        const e = evDelMesCon(ctx.paramsRodeo.get(rodeo.id) ?? null, rodeo, p.a, p.m);
        if (e) {
          ev = e.ev;
          grupo = e.grupo;
          e.advertencias.forEach((w) => vistas.add(w));
        }
      } else {
        ev = evCategoria![p.m - 1] ?? null;
        grupo = grupoDeCategoria(categoria!, p.m, ctx.campana.mesServicio);
      }
      if (ev != null) { sEv += ev * dd; cEv += dd; }
      if (grupo) {
        const g = ctx.consumo[grupo];
        const pv = rodeo && esNumero(rodeo.pesoVivo) ? rodeo.pesoVivo : g.pesoVivo;
        sMs += pv * g.pct / 100 * dd; cMs += dd;
      }
      d = proximo;
    }
    evAutomatico = cEv ? sEv / cEv : null;
    consumoPorCabeza = cMs ? sMs / cMs : null;
    fuenteEv = cocimano ? 'cocimano' : 'tabla1';
    advertencias = [...vistas];
  }

  const evEsManual = esNumero(pastoreo.evManual);
  const I = evEsManual ? pastoreo.evManual : evAutomatico;
  const K = A == null || H == null ? null : H - A;
  const conHa = D != null && D !== 0;

  const L = F == null || I == null || K == null ? null : F * I * K;
  const L2 = F == null || consumoPorCabeza == null || K == null ? null : F * consumoPorCabeza * K;
  return {
    pastoreoId: pastoreo.id,
    mes: A == null ? null : etiquetaMes(A, H),
    hectareas: D,
    cabezas: F,
    evAutomatico,
    evEsManual,
    evPorCabeza: I,
    fuenteEv,
    advertencias,
    dias: K,
    ev: {
      totales: F == null || I == null ? null : F * I,
      raciones: L,
      racionesPorHa: L == null || !conHa ? null : L / D,
      carga: I == null || F == null || !conHa ? null : (I * F) / D,
    },
    ms: {
      consumoPorCabeza,
      totales: F == null || consumoPorCabeza == null ? null : F * consumoPorCabeza,
      raciones: L2,
      racionesPorHa: L2 == null || !conHa ? null : L2 / D,
      carga: consumoPorCabeza == null || F == null || !conHa ? null : (consumoPorCabeza * F) / D,
      oferta: L2 == null ? null : L2 / (ctx.eficiencia / 100),
    },
  };
}
