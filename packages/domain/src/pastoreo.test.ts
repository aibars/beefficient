import { describe, expect, it } from 'vitest';
import { buscarSuperposicion, calcularPastoreo, diasEntre, evPorCabeza } from './pastoreo';
import { LOTES, PASTOREOS, RODEOS } from './ejemplo';

const lote7 = LOTES.find((l) => l.id === 7)!;
const vacasPrenadas = RODEOS.find((r) => r.id === 'a')!;

describe('diasEntre', () => {
  it('no cuenta la fecha de salida', () => {
    expect(diasEntre('2026-04-01', '2026-04-10')).toBe(9);
    expect(diasEntre('2026-04-01', '2026-04-15')).toBe(14);
  });

  it('cruza meses y cambios de horario sin perder días', () => {
    expect(diasEntre('2026-03-20', '2026-04-08')).toBe(19);
    expect(diasEntre('2026-02-10', '2026-03-02')).toBe(20);
  });

  it('da cero o negativo si la salida no es posterior', () => {
    expect(diasEntre('2026-04-15', '2026-04-15')).toBe(0);
    expect(diasEntre('2026-04-15', '2026-04-01')).toBe(-14);
  });
});

describe('evPorCabeza', () => {
  it('escala el factor por (PV/400)^0,75', () => {
    expect(evPorCabeza({ factorEv: 1, pesoVivo: 400 })).toBe(1);
    expect(evPorCabeza({ factorEv: 0.92, pesoVivo: 420 })).toBeCloseTo(0.9543, 4);
  });
});

describe('calcularPastoreo', () => {
  const base = {
    lote: lote7,
    rodeo: vacasPrenadas,
    cabezas: 120,
    entrada: '2026-04-01',
    salida: '2026-04-15',
  };

  it('reproduce el caso del wireframe (Lote 7, Vacas preñadas A, 120 cab., 1/4 → 15/4)', () => {
    const r = calcularPastoreo(base);
    if (!r.valido) throw new Error('debería ser válido');
    expect(r.dias).toBe(14);
    expect(r.evPorCabeza).toBeCloseTo(0.954, 3);
    expect(r.evTotales).toBeCloseTo(114.5, 1);
    expect(Math.round(r.raciones)).toBe(1603);
    expect(r.racionesPorHa).toBeCloseTo(38.2, 1);
    expect(r.carga).toBeCloseTo(2.73, 2);
    expect(r.consumoMS).toBe(1008);
    expect(r.ofertaMS).toBe(2016);
    expect(r.ofertaPeriodo).toBe(28224);
  });

  it('usa la eficiencia de cosecha indicada (50 % por defecto)', () => {
    const r = calcularPastoreo({ ...base, eficienciaCosecha: 0.6 });
    if (!r.valido) throw new Error('debería ser válido');
    expect(r.ofertaMS).toBeCloseTo(1680, 6);
  });

  it('marca inválidas las fechas con salida igual o anterior a la entrada', () => {
    expect(calcularPastoreo({ ...base, salida: '2026-04-01' })).toEqual({
      valido: false,
      motivo: 'fechas-invalidas',
    });
    expect(calcularPastoreo({ ...base, salida: '' })).toEqual({
      valido: false,
      motivo: 'fechas-invalidas',
    });
  });
});

describe('buscarSuperposicion', () => {
  it('avisa si el rodeo sigue en otro lote en la fecha de entrada', () => {
    const p = buscarSuperposicion(PASTOREOS, { rodeoId: 'a', loteId: 7, entrada: '2026-04-01' });
    expect(p).toMatchObject({ loteId: 4, salida: '2026-04-03' });
  });

  it('no avisa si entra el día que sale del otro lote', () => {
    expect(buscarSuperposicion(PASTOREOS, { rodeoId: 'a', loteId: 7, entrada: '2026-04-03' })).toBeNull();
  });

  it('no avisa si el pastoreo previo es en el mismo lote', () => {
    expect(buscarSuperposicion(PASTOREOS, { rodeoId: 'a', loteId: 4, entrada: '2026-04-01' })).toBeNull();
  });

  it('no avisa para un rodeo sin pastoreos abiertos', () => {
    expect(buscarSuperposicion(PASTOREOS, { rodeoId: 'b', loteId: 7, entrada: '2026-04-01' })).toBeNull();
  });
});
