import { describe, expect, it } from 'vitest';
import { agruparPorLote, contarPendientes } from './planilla';
import { LOTES, PASTOREOS, RODEOS } from './ejemplo';

describe('agruparPorLote', () => {
  const grupos = agruparPorLote(PASTOREOS, LOTES, RODEOS);

  it('respeta el orden de los lotes y omite los que no tienen pastoreos', () => {
    expect(grupos.map((g) => g.lote.id)).toEqual([1, 4, 7, 9]);
    expect(agruparPorLote(PASTOREOS.filter((p) => p.loteId !== 4), LOTES, RODEOS).map((g) => g.lote.id)).toEqual([
      1, 7, 9,
    ]);
  });

  it('ordena las filas por entrada, de la más nueva a la más vieja', () => {
    const extra = { ...PASTOREOS[0]!, id: 'x', entrada: '2026-04-05', salida: '2026-04-20' };
    const g = agruparPorLote([...PASTOREOS, extra], LOTES, RODEOS).find((x) => x.lote.id === 4)!;
    expect(g.filas.map((f) => f.pastoreo.entrada)).toEqual(['2026-04-05', '2026-03-15']);
  });

  it('suma las raciones del lote', () => {
    const g = grupos.find((x) => x.lote.id === 4)!;
    expect(g.totalRaciones).toBeCloseTo(g.filas[0]!.raciones, 6);
    expect(g.filas[0]!.dias).toBe(19);
  });
});

describe('contarPendientes', () => {
  it('cuenta las filas sin sincronizar', () => {
    expect(contarPendientes(PASTOREOS)).toBe(0);
    expect(contarPendientes([...PASTOREOS, { ...PASTOREOS[0]!, id: 'n', sincronizado: false }])).toBe(1);
  });
});
