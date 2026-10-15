import { describe, expect, it } from 'vitest';
import { formatearFechaCorta, formatearNumero } from './formato';

describe('formatearNumero', () => {
  it('usa punto de miles y coma decimal', () => {
    expect(formatearNumero(1603.2)).toBe('1.603');
    expect(formatearNumero(28224)).toBe('28.224');
    expect(formatearNumero(1234567.891, 2)).toBe('1.234.567,89');
    expect(formatearNumero(114.48, 1)).toBe('114,5');
    expect(formatearNumero(0.7, 3)).toBe('0,700');
    expect(formatearNumero(999)).toBe('999');
  });

  it('maneja negativos y el cero', () => {
    expect(formatearNumero(-1500)).toBe('-1.500');
    expect(formatearNumero(-0.2)).toBe('0');
  });
});

describe('formatearFechaCorta', () => {
  it('da día/mes sin ceros', () => {
    expect(formatearFechaCorta('2026-04-03')).toBe('3/4');
    expect(formatearFechaCorta('2026-12-25')).toBe('25/12');
  });
});
