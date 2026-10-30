import { describe, expect, it } from 'vitest';
import { buscarSuperposicionCampana } from './superposicion';
import type { PastoreoCampana } from './tipos';

function p(id: string, loteId: string | null, entrada: string | null, salida: string | null, rodeoId: string | null = 'r1'): PastoreoCampana {
  return { id, loteId, rodeoId, cabezas: 10, entrada, salida, categoriaTabla1Id: null, evManual: null };
}

describe('buscarSuperposicionCampana', () => {
  const existente = p('a', 'l1', '2026-04-01', '2026-04-20');

  it('devuelve el otro pastoreo cuando se cruzan en lotes distintos', () => {
    const fila = p('b', 'l2', '2026-04-10', '2026-04-30');
    expect(buscarSuperposicionCampana([existente], fila)).toBe(existente);
  });

  it('no cuenta como superposición tocarse en un día', () => {
    const fila = p('b', 'l2', '2026-04-20', '2026-04-30');
    expect(buscarSuperposicionCampana([existente], fila)).toBeNull();
  });

  it('ignora el mismo lote', () => {
    const fila = p('b', 'l1', '2026-04-10', '2026-04-30');
    expect(buscarSuperposicionCampana([existente], fila)).toBeNull();
  });

  it('ignora otro rodeo', () => {
    const fila = p('b', 'l2', '2026-04-10', '2026-04-30', 'r2');
    expect(buscarSuperposicionCampana([existente], fila)).toBeNull();
  });

  it('ignora la misma fila por id', () => {
    const fila = p('a', 'l2', '2026-04-10', '2026-04-30');
    expect(buscarSuperposicionCampana([existente], fila)).toBeNull();
  });

  it('con campos null no hay superposición', () => {
    expect(buscarSuperposicionCampana([existente], p('b', 'l2', null, '2026-04-30'))).toBeNull();
    expect(buscarSuperposicionCampana([existente], p('b', 'l2', '2026-04-10', null))).toBeNull();
    expect(buscarSuperposicionCampana([existente], p('b', null, '2026-04-10', '2026-04-30'))).toBeNull();
    expect(buscarSuperposicionCampana([existente], p('b', 'l2', '2026-04-10', '2026-04-30', null))).toBeNull();
    expect(buscarSuperposicionCampana([p('a', 'l1', null, '2026-04-20')], p('b', 'l2', '2026-04-10', '2026-04-30'))).toBeNull();
    expect(buscarSuperposicionCampana([p('a', null, '2026-04-01', '2026-04-20')], p('b', 'l2', '2026-04-10', '2026-04-30'))).toBeNull();
  });
});
