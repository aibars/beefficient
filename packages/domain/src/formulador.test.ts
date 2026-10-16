import { describe, expect, it } from 'vitest';
import {
  FORM_BASE,
  calcularRequerimientos,
  etapaDeCategoria,
  racionSugerida,
  totalRodeo,
} from './formulador';

describe('FORM_BASE', () => {
  it('conserva los coeficientes del prototipo 29/7', () => {
    expect(FORM_BASE.recria).toMatchObject({ gdp: 0.7, msPct: 2.6, em: 2.5, pb: 13, ca: 0.42, p: 0.28 });
    expect(FORM_BASE.engorde).toMatchObject({ label: 'Engorde a corral', gdp: 1.2, msPct: 2.35, em: 2.9 });
    expect(FORM_BASE.cria).toMatchObject({ gdp: 0, msPct: 2, em: 2.05, pb: 9, ca: 0.32, p: 0.24 });
  });

  it('cada ración reparte el 100 % de la MS', () => {
    for (const etapa of Object.values(FORM_BASE)) {
      expect(etapa.racion.reduce((s, r) => s + r.porcentaje, 0)).toBe(100);
    }
  });
});

describe('calcularRequerimientos', () => {
  it('recría de 280 kg en ambiente templado', () => {
    const r = calcularRequerimientos({ etapa: 'recria', pesoVivo: 280, clima: 'templado' });
    expect(r.consumoMS).toBeCloseTo(7.28, 6);
    expect(r.energia).toBeCloseTo(18.2, 6);
    expect(r.proteina).toBeCloseTo(0.9464, 6);
    expect(r.calcio).toBeCloseTo(30.576, 6);
    expect(r.fosforo).toBeCloseTo(20.384, 6);
    expect(r.gdp).toBe(0.7);
  });

  it('aplica el factor de ambiente al consumo', () => {
    const frio = calcularRequerimientos({ etapa: 'cria', pesoVivo: 420, clima: 'frio' });
    const calido = calcularRequerimientos({ etapa: 'cria', pesoVivo: 420, clima: 'calido' });
    expect(frio.consumoMS).toBeCloseTo(420 * 0.02 * 1.08, 6);
    expect(calido.consumoMS).toBeCloseTo(420 * 0.02 * 0.93, 6);
  });
});

describe('racionSugerida', () => {
  it('reparte el consumo según la etapa', () => {
    const r = racionSugerida('recria', 7.28);
    expect(r.map((x) => x.ingrediente)).toEqual([
      'Forraje / pastura',
      'Silaje de maíz',
      'Grano de maíz',
      'Núcleo proteico',
    ]);
    expect(r[0]!.kgMS).toBeCloseTo(4.004, 6);
  });
});

describe('totalRodeo', () => {
  it('multiplica los requerimientos por las cabezas', () => {
    const req = calcularRequerimientos({ etapa: 'cria', pesoVivo: 420, clima: 'templado' });
    const t = totalRodeo(req, 120);
    expect(t.consumoMS).toBeCloseTo(1008, 6);
    expect(t.energia).toBeCloseTo(2066.4, 6);
    expect(t.proteina).toBeCloseTo(90.72, 6);
  });
});

describe('etapaDeCategoria', () => {
  it('las vacas van a cría y el resto a recría', () => {
    expect(etapaDeCategoria('Vaca · gestación')).toBe('cria');
    expect(etapaDeCategoria('Novillo')).toBe('recria');
  });
});
