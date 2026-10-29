import { describe, expect, it } from 'vitest';
import Engine from './__referencia__/planilla-engine.cjs';
import { evCocimano, evDelMes, usaCocimano } from './cocimano';
import type { CategoriaRodeo, DuracionServicio, RodeoCampana } from './tipos';
import { SUPUESTOS_POR_DEFECTO } from './tablas';

// Única diferencia numérica con el Engine: la corrección de la celda 450 kg / 750 g/día / lactancia 7–8.
Engine.CORC[450][5][3] = 1.97;

function aEngine(r: RodeoCampana) {
  return {
    n: r.nombre, c: r.categoria ?? '', pv: r.pesoVivo, gan: r.ganancia,
    srv: r.inicioServicio ?? '', dur: r.duracionServicio, dest: r.destete ?? '', corc: r.usaCocimano,
  };
}

function rodeo(p: Partial<RodeoCampana>): RodeoCampana {
  return {
    id: 'r', nombre: 'R', categoria: 'Vaca', pesoVivo: 420, ganancia: Array(12).fill(null),
    inicioServicio: null, duracionServicio: 90, destete: null, usaCocimano: true, ...p,
  };
}

describe('evCocimano', () => {
  it('coincide con evCorc en toda la grilla, incluso fuera de tabla', () => {
    for (const pv of [120, 160, 200, 230, 280, 300, 333, 425, 450, 512, 550, 580, 640])
      for (const g of [null, -400, -200, -50, 0, 120, 600, 750, 900])
        for (let col = 0; col <= 8; col++) {
          const r = evCocimano(pv, g, col, 50);
          const e = Engine.evCorc(pv, g, col, Engine.SUP_DEF);
          expect(r.ev).toBeCloseTo(e.ev, 12);
          expect(r.advertencias).toEqual(e.warn);
          expect(r.pesoUsado).toBe(e.pesoUsado);
          expect(r.ganancia).toBe(e.gan);
        }
  });
  it('ganancia null cuenta como 0 g/día', () => {
    const conNull = evCocimano(420, null, 4, 50);
    expect(conNull.ev).toBe(evCocimano(420, 0, 4, 50).ev);
    expect(conNull.advertencias).toEqual([]);
  });
  it('el 450 kg / 750 g/día en lactancia 7–8 usa el valor corregido', () => {
    expect(evCocimano(450, 750, 3, 50).ev).toBeCloseTo(1.97, 12);
  });
});

describe('evDelMes', () => {
  it('coincide con evMes para cada categoría de hembra, servicio y destete', () => {
    const categorias: CategoriaRodeo[] = ['Vaca', 'Vaquillona 1er servicio', 'Vaquillona 2do servicio', 'Vaquillona de reposición'];
    const ganancias = [
      Array(12).fill(null),
      [100, null, -300, 800, 0, 250, 500, null, 900, -100, 50, 750],
      Array(12).fill(1200),
    ];
    for (const categoria of categorias)
      for (const pesoVivo of [200, 420, 560])
        for (const inicioServicio of [null, '2025-11-10'])
          for (const duracionServicio of [60, 120] as DuracionServicio[])
            for (const destete of [null, '2026-03-01'])
              for (const ganancia of ganancias) {
                const r = rodeo({ categoria, pesoVivo, inicioServicio, duracionServicio, destete, ganancia });
                const camp = { anio: 2026, mesServicio: 11 };
                const cn = Engine.normCamp({ ...camp, rodeos: [aEngine(r)] }, 2026);
                for (const anio of [2026, 2027])
                  for (let mes = 1; mes <= 12; mes++) {
                    const e = Engine.evMes(cn.rodeos[0], cn, anio, mes);
                    const v = evDelMes(r, camp, SUPUESTOS_POR_DEFECTO, anio, mes);
                    expect(v).not.toBeNull();
                    expect(v!.ev).toBeCloseTo(e.ev, 12);
                    expect(v!.advertencias).toEqual(e.warn);
                    expect(v!.grupo).toBe(e.msKey);
                  }
              }
  });
  it('devuelve null para categorías que no son hembra, como evMes', () => {
    const r = rodeo({ categoria: 'Toro' });
    const camp = { anio: 2026, mesServicio: 11 };
    const cn = Engine.normCamp({ ...camp, rodeos: [aEngine(r)] }, 2026);
    expect(Engine.evMes(cn.rodeos[0], cn, 2026, 5)).toBeNull();
    expect(evDelMes(r, camp, SUPUESTOS_POR_DEFECTO, 2026, 5)).toBeNull();
  });
});

describe('usaCocimano', () => {
  it('coincide con usaCorc', () => {
    const casos: (RodeoCampana | undefined)[] = [
      undefined, rodeo({}), rodeo({ pesoVivo: null }), rodeo({ usaCocimano: false }),
      rodeo({ categoria: 'Toro' }), rodeo({ categoria: null }), rodeo({ categoria: 'Vaquillona de reposición' }),
    ];
    for (const r of casos) {
      const e = Engine.usaCorc(r ? aEngine(r) : undefined, { anio: 2026, mesServicio: 11 });
      expect(usaCocimano(r)).toBe(e);
    }
  });
});
