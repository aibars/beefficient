// Planilla de pastoreo agrupada por lote.
import { calcularPastoreo } from './pastoreo';
import type { Lote, Pastoreo, Rodeo } from './tipos';

export interface FilaPlanilla {
  pastoreo: Pastoreo;
  rodeo: Rodeo;
  dias: number;
  raciones: number;
}

export interface GrupoLote {
  lote: Lote;
  totalRaciones: number;
  filas: FilaPlanilla[];
}

/** Agrupa por lote, en el orden de `lotes`, con las entradas más nuevas primero.
 *
 * @deprecated No reproduce la planilla CREA. Usar calcularCampana (motor/). Se quita cuando BFC-26 y BFC-29 migren las pantallas.
 */
export function agruparPorLote(
  pastoreos: readonly Pastoreo[],
  lotes: readonly Lote[],
  rodeos: readonly Rodeo[],
): GrupoLote[] {
  return lotes.flatMap((lote) => {
    const filas = pastoreos
      .filter((p) => p.loteId === lote.id)
      .sort((a, b) => b.entrada.localeCompare(a.entrada))
      .flatMap((pastoreo): FilaPlanilla[] => {
        const rodeo = rodeos.find((r) => r.id === pastoreo.rodeoId);
        if (!rodeo) return [];
        const c = calcularPastoreo({ ...pastoreo, lote, rodeo });
        return [{ pastoreo, rodeo, dias: c.valido ? c.dias : 0, raciones: c.valido ? c.raciones : 0 }];
      });
    if (!filas.length) return [];
    return [{ lote, filas, totalRaciones: filas.reduce((s, f) => s + f.raciones, 0) }];
  });
}

export const contarPendientes = (pastoreos: readonly Pastoreo[]): number =>
  pastoreos.filter((p) => !p.sincronizado).length;
