import { describe, expect, it } from 'vitest';
import Engine from './__referencia__/planilla-engine.cjs';
import { diaDe, etiquetaMes, fechaDe, mesDelCiclo } from './fechas';

describe('fechas', () => {
  it('etiquetaMes: un mes o un rango; la salida no se cuenta', () => {
    expect(etiquetaMes(diaDe('2026-04-01')!, diaDe('2026-04-15')!)).toBe('abril 2026');
    expect(etiquetaMes(diaDe('2026-04-01')!, diaDe('2026-05-01')!)).toBe('abril 2026');
    expect(etiquetaMes(diaDe('2026-03-20')!, diaDe('2026-05-10')!)).toBe('mar a may 2026');
    expect(etiquetaMes(diaDe('2026-04-01')!, null)).toBe('abril 2026');
    expect(etiquetaMes(diaDe('2026-04-01')!, diaDe('2026-04-01')!)).toBe('abril 2026');
    expect(etiquetaMes(diaDe('2026-04-01')!, diaDe('2026-03-25')!)).toBe('abril 2026');
  });

  it('mesDelCiclo = MOD(mes − servicio + 3; 12) + 1', () => {
    expect(mesDelCiclo(3, 11)).toBe(8);
    expect(mesDelCiclo(4, 11)).toBe(9);
    for (let s = 1; s <= 12; s++) {
      for (let m = 1; m <= 12; m++) expect(mesDelCiclo(m, s)).toBe(Engine.cicloDe(m, s));
    }
  });

  it('diaDe y fechaDe coinciden con el Engine e ignoran fechas mal formadas', () => {
    expect(diaDe('2026-03-01')).toBe(Engine.dayOf('2026-03-01'));
    expect(fechaDe(diaDe('2024-02-29')!)).toBe('2024-02-29');
    expect(diaDe('2026-3-1')).toBeNull();
    expect(diaDe('2026-02-30')).toBeNull();
    expect(diaDe('2026-13-01')).toBeNull();
    expect(diaDe('2025-02-29')).toBeNull();
    expect(diaDe('2024-02-29')).not.toBeNull();
    expect(diaDe(null)).toBeNull();
  });
});
