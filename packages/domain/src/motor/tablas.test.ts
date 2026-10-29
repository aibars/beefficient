import { describe, expect, it } from 'vitest';
import Engine from './__referencia__/planilla-engine.cjs';
import {
  CATEGORIAS_RODEO,
  COCIMANO,
  COCIMANO_VAQ,
  CONSUMO_POR_DEFECTO,
  SUPUESTOS_POR_DEFECTO,
  TABLA_1,
} from './tablas';
import type { GrupoConsumo } from './tipos';

// El Engine no exporta BASE; plantillaBase() devuelve sus 16 filas fijas más 4 libres.
const BASE_ENGINE: [string, (number | null)[]][] = Engine.plantillaBase()
  .slice(0, Engine.BASE_FIJAS)
  .map((r: { n: string; ev: (number | null)[] }) => [r.n, r.ev]);

describe('tablas de referencia', () => {
  it('TABLA_1 transcribe el BASE del Engine', () => {
    expect(TABLA_1.map((f) => [f.nombre, f.ev])).toEqual(BASE_ENGINE);
    expect(TABLA_1.map((f) => f.grupoConsumo)).toEqual(
      BASE_ENGINE.map(([n]) => Engine.MS_DE_CAT[n.toLowerCase()]),
    );
  });

  it('TABLA_1 tiene 16 filas con 12 ajustes nulos e ids únicos', () => {
    expect(TABLA_1).toHaveLength(16);
    expect(new Set(TABLA_1.map((f) => f.id)).size).toBe(16);
    for (const f of TABLA_1) {
      expect(f.ev).toHaveLength(12);
      expect(f.ajustes).toEqual(Array(12).fill(null));
    }
  });

  it('COCIMANO transcribe el CORC del Engine, sin correcciones hasta BFC-58', () => {
    expect(COCIMANO).toEqual(Engine.CORC);
    expect(COCIMANO[450][5]![3]).toBe(1.87);
  });

  it('vaquillonas livianas, %PV y supuestos coinciden con el Engine', () => {
    expect(COCIMANO_VAQ).toEqual(Engine.CORC_VAQ);
    for (const p of Engine.PVMS_DEF) {
      expect(CONSUMO_POR_DEFECTO[p.k as GrupoConsumo]).toEqual({ pesoVivo: p.pv, pct: p.pct });
    }
    expect(SUPUESTOS_POR_DEFECTO).toEqual({
      gestacion: Engine.SUP_DEF.gest,
      fraccionServicio: Engine.SUP_DEF.fracServ,
      margenExtrapolacion: Engine.SUP_DEF.margen,
      diasPorMes: Engine.SUP_DEF.diasMes,
    });
    expect(CATEGORIAS_RODEO).toEqual(Engine.CAT_RODEO);
  });
});
