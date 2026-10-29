// Puente entre el motor y el Engine de referencia de la planilla. Solo para tests de fidelidad.
import { expect } from 'vitest';
import Engine from './planilla-engine.cjs';
import { fechaDe } from '../fechas';
import { TABLA_1 } from '../tablas';
import type {
  Campana, CategoriaRodeo, FilaCalculada, GrupoConsumo, ResultadoLote, ResultadoMes, ResultadoRodeo, ResultadosCampana,
} from '../tipos';

/** Única desviación permitida: la celda 450 kg / 750 g/día / lactancia 7–8 de Cocimano (1,87 → 1,97). */
function parchearCocimano(): void {
  Engine.CORC[450][5][3] = 1.97;
}

/** Nombre del Engine para un id; un id que no existe da un nombre que el Engine tampoco conoce. */
function nombrePorId(lista: readonly { id: string; nombre: string }[], id: string | null): string {
  if (!id) return '';
  const x = lista.find((e) => e.id === id);
  return x ? x.nombre : `?${id}`;
}

/** Arma la campaña en el formato del Engine (vínculos por nombre) y la calcula. */
export function correrEngine(c: Campana): any {
  parchearCocimano();
  const tabla1 = c.tabla1 ?? TABLA_1;
  const d = {
    anio: c.anio,
    mesServicio: c.mesServicio,
    efic: c.eficienciaCosecha,
    lotes: c.lotes.map((l) => ({ n: l.nombre, h: l.hectareas })),
    rodeos: c.rodeos.map((r) => ({
      n: r.nombre, c: r.categoria ?? '', pv: r.pesoVivo, gan: r.ganancia,
      srv: r.inicioServicio ?? '', dur: r.duracionServicio, dest: r.destete ?? '', corc: r.usaCocimano,
    })),
    base: tabla1.map((t, i) => ({
      n: t.nombre, ev: t.ev, aj: t.ajustes,
      ms: i < Engine.BASE_FIJAS ? '' : t.grupoConsumo === 'vaca' ? '' : t.grupoConsumo,
    })),
    movs: c.pastoreos.map((p) => ({
      e: p.entrada ?? '', s: p.salida ?? '',
      l: nombrePorId(c.lotes, p.loteId), r: nombrePorId(c.rodeos, p.rodeoId), k: nombrePorId(tabla1, p.categoriaTabla1Id),
      c: p.cabezas, ev: p.evManual,
    })),
    pvms: c.consumo
      ? (Object.entries(c.consumo) as [GrupoConsumo, { pesoVivo: number; pct: number }][]).map(([k, g]) => ({ k, pv: g.pesoVivo, pct: g.pct }))
      : undefined,
    sup: c.supuestos
      ? {
          gest: c.supuestos.gestacion, fracServ: c.supuestos.fraccionServicio,
          margen: c.supuestos.margenExtrapolacion, diasMes: c.supuestos.diasPorMes,
        }
      : undefined,
  };
  return Engine.calcular(Engine.normCamp(d, c.anio));
}

const nulo = <T>(v: T | ''): T | null => (v === '' ? null : v);

/** Una fila de `calcRow` con los nombres de campo del motor y `''` → `null`. */
export function filaDelEngine(
  x: any,
): Omit<FilaCalculada, 'pastoreoId' | 'advertencias' | 'evEsManual'> & { advertencias: string[] } {
  return {
    mes: nulo(x.B),
    hectareas: nulo(x.D),
    cabezas: nulo(x.F),
    evAutomatico: nulo(x.evAuto),
    evPorCabeza: nulo(x.I),
    fuenteEv: x.src === 'corc' ? 'cocimano' : x.src === 'tabla' ? 'tabla1' : null,
    advertencias: x.warn,
    dias: nulo(x.K),
    ev: { totales: nulo(x.J), raciones: nulo(x.L), racionesPorHa: nulo(x.M), carga: nulo(x.N) },
    ms: {
      consumoPorCabeza: nulo(x.ms), totales: nulo(x.J2), raciones: nulo(x.L2),
      racionesPorHa: nulo(x.M2), carga: nulo(x.N2), oferta: nulo(x.O2),
    },
  };
}

/** Del nombre que el adaptador le pasó al Engine (en minúsculas, como agrupa el Engine) al id del pastoreo. */
function idsPorNombre(lista: readonly { id: string; nombre: string }[], ids: readonly (string | null)[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const id of ids) {
    if (!id) continue;
    const k = nombrePorId(lista, id).toLocaleLowerCase('es');
    if (!out.has(k)) out.set(k, id);
  }
  return out;
}

/**
 * El resultado de `resultados` (EV o MS) con los nombres de campo del motor: nombres → ids,
 * `months` → `FechaISO`, `''` → `null`; categoría `''` o `'(sin rodeo)'` → `null`; rodeo `'(sin rodeo)'` → `null`.
 */
export function resultadosDelEngine(R: any, c: Campana): ResultadosCampana {
  const lotes = idsPorNombre(c.lotes, c.pastoreos.map((p) => p.loteId));
  const rodeos = idsPorNombre(c.rodeos, c.pastoreos.map((p) => p.rodeoId));
  const idDe = (m: Map<string, string>, nombre: string): string => {
    const id = m.get(nombre.toLocaleLowerCase('es'));
    if (id == null) throw new Error(`El Engine devolvió un nombre sin id: ${nombre}`);
    return id;
  };
  const porMes: ResultadoMes[] = R.cargaMensual.map((x: any, k: number) => ({
    mes: fechaDe(x.ms), promedio: x.ev, carga: nulo(x.carga), raciones: R.racMes[k], oferta: R.oferMes[k],
  }));
  const lotesR: ResultadoLote[] = R.lotes.map((l: any) => ({
    loteId: idDe(lotes, l.lote), hectareas: l.has, diasPorMes: l.diasMes, dias: l.dias, diasLibres: l.libres,
    ocupacion: l.io, carga: l.carga, raciones: l.rac, racionesPorHa: l.racHa, racionesPorMes: l.racMes,
    oferta: l.ofer, ofertaPorHa: l.oferHa, ofertaPorMes: l.oferMes, pastoreos: l.cnt,
    racionesPromedio: l.racProm, racionesPorHaPromedio: l.racHaProm,
  }));
  const rodeosR: ResultadoRodeo[] = R.rodeos.map((r: any) => ({
    rodeoId: r.rodeo === '(sin rodeo)' ? null : idDe(rodeos, r.rodeo),
    categoria: r.cat === '' || r.cat === '(sin rodeo)' ? null : (r.cat as CategoriaRodeo),
    cabezasPorMes: r.cab,
  }));
  return {
    unidad: R.u, hayDatos: R.ok, meses: R.months.map((ms: number) => fechaDe(ms)), diasAnio: R.diasAnio,
    superficieTotal: R.supTotal, eficienciaCosecha: R.efic, porMes, lotes: lotesR, rodeos: rodeosR,
    cargaAnual: R.cargaAnual, racionesTotales: R.racTotal,
  };
}

/**
 * Compara solo las claves presentes en `esperado`, recursivamente (objetos y arrays).
 * Números con `toBeCloseTo(esperado, 9)`; lo demás (null, strings, booleanos, largo de arrays), exacto.
 */
export function expectParecido(real: unknown, esperado: unknown, ruta = '$'): void {
  if (typeof esperado === 'number') {
    expect(typeof real, ruta).toBe('number');
    expect(real as number, ruta).toBeCloseTo(esperado, 9);
  } else if (Array.isArray(esperado)) {
    expect(Array.isArray(real), ruta).toBe(true);
    const r = real as unknown[];
    expect(r.length, `${ruta}.length`).toBe(esperado.length);
    esperado.forEach((e, i) => expectParecido(r[i], e, `${ruta}[${i}]`));
  } else if (esperado !== null && typeof esperado === 'object') {
    expect(real !== null && typeof real === 'object', ruta).toBe(true);
    const r = real as Record<string, unknown>;
    for (const [k, e] of Object.entries(esperado)) expectParecido(r[k], e, `${ruta}.${k}`);
  } else {
    expect(real, ruta).toBe(esperado);
  }
}
