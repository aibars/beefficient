import { enRango, RANGOS } from './rangos';

describe('enRango', () => {
  it('acepta vacío y valores dentro de los límites', () => {
    expect(enRango('', RANGOS.cabezas)).toBe(true);
    expect(enRango('1', RANGOS.cabezas)).toBe(true);
    expect(enRango('0.001', RANGOS.evManual)).toBe(true);
    expect(enRango('100', RANGOS.eficiencia)).toBe(true);
  });

  it('rechaza fuera de rango, no enteros donde va entero y texto no numérico', () => {
    expect(enRango('0', RANGOS.cabezas)).toBe(false);
    expect(enRango('2.5', RANGOS.cabezas)).toBe(false);
    expect(enRango('1000', RANGOS.evManual)).toBe(false);
    expect(enRango('0', RANGOS.hectareas)).toBe(false);
    expect(enRango('100000', RANGOS.pesoVivo)).toBe(false);
    expect(enRango('abc', RANGOS.eficiencia)).toBe(false);
  });
});
