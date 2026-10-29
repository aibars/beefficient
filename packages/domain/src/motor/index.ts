import { calcularFila, crearContexto } from './fila';
import { prepararResultados, resultadosEn } from './resultados';
import type { Campana, CalculoCampana } from './tipos';

export * from './tipos';
export * from './tablas';
export { evCocimano } from './cocimano';
export { etiquetaMes, mesDelCiclo } from './fechas';

/** Calcula la campaña como la planilla CREA: filas y resultados en EV y en MS. */
export function calcularCampana(campana: Campana): CalculoCampana {
  const ctx = crearContexto(campana);
  const filas = campana.pastoreos.map((p) => calcularFila(p, ctx));
  const base = prepararResultados(filas, ctx);
  return { filas, ev: resultadosEn(base, 'EV'), ms: resultadosEn(base, 'MS') };
}
