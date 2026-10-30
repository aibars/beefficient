import {
  buscarSuperposicionCampana,
  calcularCampana,
  NOMBRES_MES,
  NOMBRES_MES_CORTOS,
  type CalculoCampana,
  type Campana,
  type FechaISO,
  type FilaCalculada,
  type PastoreoCampana,
  type ResultadosCampana,
} from '@beefficient/domain';

export type Unidad = 'EV' | 'MS';

// Los nombres de mes son los del motor: la columna Mes y las etiquetas de la web dicen lo mismo.
export { NOMBRES_MES };

export function resultadosEn(calculo: CalculoCampana, unidad: Unidad): ResultadosCampana {
  return unidad === 'EV' ? calculo.ev : calculo.ms;
}

/** '2026-12-01' → 'dic 26'; septiembre → 'sept 26', como la columna Mes del motor. */
export function etiquetaMesCorto(mes: FechaISO): string {
  const [anio, m] = mes.split('-');
  const nombre = NOMBRES_MES_CORTOS[Number(m) - 1] ?? '';
  return `${nombre} ${(anio ?? '').slice(-2)}`;
}

/** Los pastoreos con el borrador: reemplaza al de su id o se agrega al final. */
export function conBorrador(
  pastoreos: readonly PastoreoCampana[],
  borrador: PastoreoCampana,
): PastoreoCampana[] {
  return pastoreos.some((p) => p.id === borrador.id)
    ? pastoreos.map((p) => (p.id === borrador.id ? borrador : p))
    : [...pastoreos, borrador];
}

/** Calcula la fila de un borrador dentro de la campaña, sin guardarlo. */
export function calcularBorrador(campana: Campana, borrador: PastoreoCampana): FilaCalculada {
  const pastoreos = conBorrador(campana.pastoreos, borrador);
  const calculo = calcularCampana({ ...campana, pastoreos });
  return calculo.filas.find((f) => f.pastoreoId === borrador.id)!;
}

export type Aviso = 'extrapolado' | 'fuera-de-tabla' | 'ganancia' | 'fechas' | 'superpuesto';

export const TEXTO_AVISO: Record<Aviso, string> = {
  extrapolado: 'Peso fuera de la tabla de Cocimano: valor extrapolado',
  'fuera-de-tabla': 'Peso fuera de la tabla de Cocimano',
  ganancia: 'Ganancia fuera de la tabla de Cocimano',
  fechas: 'La salida no es posterior a la entrada',
  superpuesto: 'El rodeo está en otro lote en esas fechas',
};

const DE_MOTOR = { extrap: 'extrapolado', fuera: 'fuera-de-tabla', gan: 'ganancia' } as const;

export function avisosDeFila(
  fila: FilaCalculada,
  pastoreo: PastoreoCampana,
  todos: readonly PastoreoCampana[],
): Aviso[] {
  const avisos: Aviso[] = fila.advertencias.map((a) => DE_MOTOR[a]);
  if (fila.dias !== null && fila.dias <= 0) avisos.push('fechas');
  if (buscarSuperposicionCampana(todos, pastoreo)) avisos.push('superpuesto');
  return avisos;
}
