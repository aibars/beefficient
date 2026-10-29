import { describe, expect, it } from 'vitest';
import { correrEngine, expectParecido, filaDelEngine } from './__referencia__/adaptador';
import { CAMPANAS, campanaAleatoria } from './__referencia__/campanas';
import { calcularFila, crearContexto } from './fila';
import type { Campana, PastoreoCampana, RodeoCampana } from './tipos';

const manual = CAMPANAS.manual!;

function con(c: Campana, p: Partial<PastoreoCampana>, rodeos: RodeoCampana[] = []) {
  const campana: Campana = { ...c, rodeos: [...c.rodeos, ...rodeos] };
  const pastoreo: PastoreoCampana = { ...c.pastoreos[0]!, id: 'x', evManual: null, ...p };
  return { p: pastoreo, ctx: crearContexto(campana) };
}

describe('calcularFila', () => {
  it('Toros en la Tabla 1, dentro de un mes', () => {
    const f = calcularFila(manual.pastoreos[0]!, crearContexto(manual));
    expect(f).toMatchObject({ mes: 'abril 2026', hectareas: 10, evPorCabeza: 1.3, fuenteEv: 'tabla1', dias: 10,
      ev: { totales: 13, raciones: 130, racionesPorHa: 13, carga: 1.3 } });
    expect(f.ms).toEqual({ consumoPorCabeza: 14.4, totales: 144, raciones: 1440, racionesPorHa: 144, carga: 14.4, oferta: 2880 });
    expect(f.evEsManual).toBe(false);
    expect(f.advertencias).toEqual([]);
  });

  it('Vacas de cría que cruzan de marzo a abril promedian EV y consumo por días', () => {
    // 5 días en marzo (ciclo 8: 0,80) + 3 en abril (ciclo 9: 0,82); grupo seca 2,0 % × 400 kg
    const f = calcularFila(manual.pastoreos[2]!, crearContexto(manual));
    expect(f.mes).toBe('mar a abr 2026');
    expect(f.evPorCabeza).toBeCloseTo(0.8075, 12);
    expect(f.ev).toMatchObject({ raciones: 646, racionesPorHa: 16.15, carga: 2.01875 });
    expect(f.ms).toMatchObject({ consumoPorCabeza: 8, raciones: 6400, oferta: 12800 });
  });

  it('el EV a mano pisa al automático', () => {
    const { p, ctx } = con(manual, { evManual: 1.1 });
    const f = calcularFila(p, ctx);
    expect(f).toMatchObject({ evPorCabeza: 1.1, evEsManual: true, evAutomatico: 1.3, fuenteEv: 'tabla1' });
    expect(f.ev.raciones).toBeCloseTo(110, 12);
  });

  it('lote sin hectáreas: raciones/ha y carga en null', () => {
    const c: Campana = { ...manual, lotes: [...manual.lotes, { id: 'C', nombre: 'C', hectareas: null }] };
    const { p, ctx } = con(c, { loteId: 'C' });
    const f = calcularFila(p, ctx);
    expect(f.hectareas).toBe(0);
    expect(f.ev).toEqual({ totales: 13, raciones: 130, racionesPorHa: null, carga: null });
    expect(f.ms).toMatchObject({ racionesPorHa: null, carga: null, oferta: 2880 });
    expect(ctx.superficieTotal).toBe(50);
  });

  it('ids que no existen se tratan como dato faltante', () => {
    const lote = con(manual, { loteId: 'x' });
    expect(() => calcularFila(lote.p, lote.ctx)).not.toThrow();
    expect(calcularFila(lote.p, lote.ctx)).toMatchObject({ hectareas: null, ev: { raciones: 130, racionesPorHa: null } });

    // sin rodeo, el consumo usa el peso del grupo: toro 700 kg × 1,8 %
    const rodeo = con(manual, { rodeoId: 'x' });
    expect(calcularFila(rodeo.p, rodeo.ctx).ms.consumoPorCabeza).toBeCloseTo(12.6, 12);

    const categoria = con(manual, { categoriaTabla1Id: 'x' });
    expect(calcularFila(categoria.p, categoria.ctx)).toMatchObject({
      evAutomatico: null, evPorCabeza: null, fuenteEv: null, ev: { totales: null }, ms: { consumoPorCabeza: null },
    });
  });

  it('vaca sin peso vivo cae a la Tabla 1', () => {
    const sinPeso: RodeoCampana = { ...manual.rodeos[1]!, id: 'S', nombre: 'S', pesoVivo: null, usaCocimano: true };
    const conCategoria = con(manual, { rodeoId: 'S', categoriaTabla1Id: 'vacas-cria' }, [sinPeso]);
    const f = calcularFila(conCategoria.p, conCategoria.ctx);
    expect(f).toMatchObject({ fuenteEv: 'tabla1', evAutomatico: 0.82 });
    // sin peso del rodeo, el consumo usa el del grupo: seca 450 kg × 2,0 %
    expect(f.ms.consumoPorCabeza).toBeCloseTo(9, 12);

    const sinCategoria = con(manual, { rodeoId: 'S', categoriaTabla1Id: null }, [sinPeso]);
    expect(calcularFila(sinCategoria.p, sinCategoria.ctx)).toMatchObject({ evAutomatico: null, fuenteEv: null });
  });

  it('vaca con peso usa Cocimano', () => {
    const conPeso: RodeoCampana = { ...manual.rodeos[1]!, id: 'S', nombre: 'S', usaCocimano: true };
    const { p, ctx } = con(manual, { rodeoId: 'S', categoriaTabla1Id: null }, [conPeso]);
    expect(calcularFila(p, ctx).fuenteEv).toBe('cocimano');
  });

  it('sin salida o con salida ≤ entrada se evalúa un solo día', () => {
    const sinSalida = con(manual, { salida: null });
    expect(calcularFila(sinSalida.p, sinSalida.ctx)).toMatchObject({
      mes: 'abril 2026', dias: null, evPorCabeza: 1.3, ev: { totales: 13, raciones: null, racionesPorHa: null, carga: 1.3 },
    });
    const alReves = con(manual, { salida: '2026-03-25' });
    expect(calcularFila(alReves.p, alReves.ctx)).toMatchObject({ dias: -7, evPorCabeza: 1.3, ev: { raciones: -91 } });
  });

  it('eficiencia fuera de (0, 100] vale 50', () => {
    expect(crearContexto({ ...manual, eficienciaCosecha: 0 }).eficiencia).toBe(50);
    expect(crearContexto({ ...manual, eficienciaCosecha: 101 }).eficiencia).toBe(50);
    expect(crearContexto({ ...manual, eficienciaCosecha: 100 }).eficiencia).toBe(100);
  });
});

describe('fidelidad con calcRow', () => {
  it('la campaña aleatoria es reproducible', () => {
    expect(campanaAleatoria(7)).toEqual(campanaAleatoria(7));
  });

  const casos = [
    ...Object.entries(CAMPANAS),
    ...Array.from({ length: 300 }, (_, i) => [`aleatoria ${i}`, campanaAleatoria(i)] as const),
  ];
  it.each(casos)('cada fila coincide con calcRow: %s', (_, c) => {
    const ref = correrEngine(c);
    const ctx = crearContexto(c);
    expect(ref.calc).toHaveLength(c.pastoreos.length);
    c.pastoreos.forEach((p, i) => expectParecido(calcularFila(p, ctx), filaDelEngine(ref.calc[i]), `fila ${i}`));
  });
});
