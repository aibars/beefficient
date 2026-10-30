import type { PastoreoCampana } from './tipos';

type FilaPastoreo = Pick<PastoreoCampana, 'id' | 'rodeoId' | 'loteId' | 'entrada' | 'salida'>;

/**
 * Primer pastoreo del mismo rodeo, en otro lote, que se cruza en fechas con `fila`.
 * La salida no cuenta: tocarse en un día no es superposición. Con datos a medio cargar, null.
 */
export function buscarSuperposicionCampana(
  pastoreos: readonly PastoreoCampana[],
  fila: FilaPastoreo,
): PastoreoCampana | null {
  const { rodeoId, loteId, entrada, salida } = fila;
  if (!rodeoId || !loteId || !entrada || !salida) return null;
  return (
    pastoreos.find(
      (p) =>
        p.id !== fila.id &&
        p.rodeoId === rodeoId &&
        !!p.loteId &&
        p.loteId !== loteId &&
        !!p.entrada &&
        !!p.salida &&
        p.entrada < salida &&
        entrada < p.salida,
    ) ?? null
  );
}
