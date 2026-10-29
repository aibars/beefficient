import { describe, expect, it } from 'vitest';
import { correrEngine, expectParecido, resultadosDelEngine } from './__referencia__/adaptador';
import { CAMPANAS, campanaAleatoria } from './__referencia__/campanas';
import { calcularFila, crearContexto } from './fila';
import { calcularResultados } from './resultados';
import type { Campana, PastoreoCampana } from './tipos';

const manual = CAMPANAS.manual!;

function resultados(c: Campana, unidad: 'EV' | 'MS' = 'EV') {
  const ctx = crearContexto(c);
  return calcularResultados(c.pastoreos.map((p) => calcularFila(p, ctx)), ctx, unidad);
}

function pastoreo(p: Partial<PastoreoCampana>): PastoreoCampana {
  return { ...manual.pastoreos[0]!, evManual: null, ...p };
}

describe('calcularResultados', () => {
  it('dos pastoreos superpuestos en el mismo lote no duplican días', () => {
    // dos pastoreos de T en B: 04-01→04-11 y 04-06→04-16, y el de V en A (03-27→04-04)
    const r = resultados(manual);
    expect(r).toMatchObject({ unidad: 'EV', hayDatos: true, meses: ['2026-03-01', '2026-04-01'], superficieTotal: 50, eficienciaCosecha: 50 });
    const B = r.lotes.find((l) => l.loteId === 'B')!;
    expect(B).toMatchObject({ dias: 15, diasLibres: 350, raciones: 260, pastoreos: 2 });
    expect(B.diasPorMes).toEqual([0, 15]);
    expect(B.carga).toBeCloseTo(260 / (10 * 15), 12);
    expect(B.ocupacion).toBeCloseTo(15 / 365, 12);
    expect(r.diasAnio).toBe(365);
    // marzo: 100 vacas × 0,8075 EV × 5 días / 31; abril: 2 × 13 EV × 10 días + 80,75 EV × 3 días, sobre 30
    expect(r.porMes.map((m) => m.promedio)).toEqual([expect.closeTo(13.024193548387096, 9), expect.closeTo(16.741666666666667, 9)]);
    expect(r.porMes[1]!.carga).toBeCloseTo(0.3348333333333333, 12);
    expect(r.porMes.map((m) => m.mes)).toEqual(['2026-03-01', '2026-04-01']);
  });

  it('lotes y rodeos ordenados por nombre; cabezas el primer día de cada mes', () => {
    const r = resultados(manual);
    expect(r.lotes.map((l) => l.loteId)).toEqual(['A', 'B']);
    expect(r.rodeos).toEqual([
      { rodeoId: 'T', categoria: 'Toro', cabezasPorMes: [0, 10] },
      { rodeoId: 'V', categoria: 'Vaca', cabezasPorMes: [0, 100] },
    ]);
  });

  it('un pastoreo sin rodeo va al grupo «sin rodeo», que ordena como «(sin rodeo)»', () => {
    const c: Campana = { ...manual, pastoreos: [...manual.pastoreos, pastoreo({ id: 'x', rodeoId: null })] };
    const r = resultados(c);
    expect(r.rodeos.map((x) => x.rodeoId)).toEqual([null, 'T', 'V']);
    expect(r.rodeos[0]).toEqual({ rodeoId: null, categoria: null, cabezasPorMes: [0, 10] });
  });

  it('en kg MS usa los totales y raciones de MS', () => {
    const r = resultados(manual, 'MS');
    const B = r.lotes.find((l) => l.loteId === 'B')!;
    // 10 toros × 14,4 kg MS × 10 días, dos veces
    expect(B.raciones).toBeCloseTo(2880, 9);
    expect(B.oferta).toBeCloseTo(5760, 9);
    expect(r.unidad).toBe('MS');
  });

  it('campaña sin pastoreos completos: hayDatos false y listas vacías', () => {
    const c: Campana = {
      ...manual,
      pastoreos: [pastoreo({ id: 'sin-salida', salida: null }), pastoreo({ id: 'sin-lote', loteId: null })],
    };
    const r = resultados(c);
    expect(r).toMatchObject({ hayDatos: false, meses: [], porMes: [], lotes: [], rodeos: [], cargaAnual: 0, racionesTotales: 0 });
  });

  it('lote sin hectáreas: carga 0, no NaN', () => {
    const c: Campana = {
      ...manual,
      lotes: [...manual.lotes, { id: 'C', nombre: 'C', hectareas: null }],
      pastoreos: [...manual.pastoreos, pastoreo({ id: 'x', loteId: 'C' })],
    };
    const l = resultados(c).lotes.find((x) => x.loteId === 'C')!;
    expect(Number.isNaN(l.carga)).toBe(false);
    expect(l.carga).toBe(0);
    expect(l.hectareas).toBe(0);
  });

  it('los días del año salen del año de la primera entrada con lote, aunque la fila no esté completa', () => {
    const c: Campana = { ...manual, pastoreos: [...manual.pastoreos, pastoreo({ id: 'x', entrada: '2024-12-31', salida: null })] };
    expect(resultados(c).diasAnio).toBe(366);
  });
});

describe('fidelidad con resultados', () => {
  const casos = [
    ...Object.entries(CAMPANAS),
    ...Array.from({ length: 300 }, (_, i) => [`aleatoria ${i}`, campanaAleatoria(i)] as const),
  ];
  it.each(casos)('EV y MS coinciden con resultados: %s', (_, c) => {
    const ref = correrEngine(c);
    const ctx = crearContexto(c);
    const filas = c.pastoreos.map((p) => calcularFila(p, ctx));
    expectParecido(calcularResultados(filas, ctx, 'EV'), resultadosDelEngine(ref.res, c), 'EV');
    expectParecido(calcularResultados(filas, ctx, 'MS'), resultadosDelEngine(ref.resMS, c), 'MS');
  });
});
