import { calcularCampana } from '@beefficient/domain';
import { CAMPANA_EJEMPLO, LOTES_EJEMPLO, POTREROS_EJEMPLO } from './planilla-ejemplo.data';

describe('planilla de ejemplo', () => {
  const { filas, ev } = calcularCampana(CAMPANA_EJEMPLO);

  it('no tiene filas sin días por error de carga', () =>
    expect(filas.every((f) => f.dias !== null && f.dias > 0)).toBe(true));
  it('usa Cocimano en alguna fila', () => expect(filas.some((f) => f.fuenteEv === 'cocimano')).toBe(true));
  it('usa la Tabla 1 en alguna fila', () => expect(filas.some((f) => f.fuenteEv === 'tabla1')).toBe(true));
  it('tiene un EV manual', () => expect(filas.some((f) => f.evEsManual)).toBe(true));
  it('tiene un peso fuera de la tabla', () => expect(filas.some((f) => f.advertencias.length > 0)).toBe(true));
  it('tiene un pastoreo de varios meses', () => expect(filas.some((f) => f.mes?.includes(' a '))).toBe(true));
  it('deja algún lote libre algunos meses', () => expect(ev.lotes.some((l) => l.diasLibres > 0)).toBe(true));
  it('incluye una vaca con servicio y destete', () =>
    expect(CAMPANA_EJEMPLO.rodeos.some((r) => r.categoria === 'Vaca' && r.inicioServicio && r.destete)).toBe(true));
  it('tiene 2 potreros y 3 lotes, uno sin potrero', () => {
    expect(POTREROS_EJEMPLO).toHaveLength(2);
    expect(LOTES_EJEMPLO).toHaveLength(3);
    expect(LOTES_EJEMPLO.some((l) => l.potreroId === null)).toBe(true);
  });
});
