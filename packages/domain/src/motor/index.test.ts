import { expect, it } from 'vitest';
import * as dominio from '../index';
import { CAMPANAS } from './__referencia__/campanas';
import { calcularFila, crearContexto } from './fila';
import { calcularCampana } from './index';
import { calcularResultados } from './resultados';

it('calcularCampana = filas + resultados en las dos unidades', () => {
  const c = CAMPANAS.manual!;
  const r = calcularCampana(c);
  const ctx = crearContexto(c);
  expect(r.filas).toEqual(c.pastoreos.map((p) => calcularFila(p, ctx)));
  expect(r.ev).toEqual(calcularResultados(r.filas, ctx, 'EV'));
  expect(r.ms).toEqual(calcularResultados(r.filas, ctx, 'MS'));
});

it('el paquete exporta el motor y no el Engine de referencia', () => {
  expect(dominio.calcularCampana).toBeTypeOf('function');
  expect(dominio.TABLA_1).toHaveLength(16);
  expect('Engine' in dominio).toBe(false);
  expect(dominio.calcularPastoreo).toBeTypeOf('function'); // el cálculo viejo sigue
});
