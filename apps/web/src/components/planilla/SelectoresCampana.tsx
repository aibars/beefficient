'use client';

import type { CampanaResumen } from '@/services/planilla.service';
import type { Establecimiento } from '@/services/farms.service';

interface Props {
  establecimientos: readonly Establecimiento[];
  establecimientoId: string | null;
  onCambiarEstablecimiento: (id: string) => void;
  campanas: readonly CampanaResumen[];
  campanaId: string | null;
  onElegirCampana: (id: string) => void;
}

/** Selectores de establecimiento y campaña, compartidos por Planilla y Configuración. */
export function SelectoresCampana({
  establecimientos,
  establecimientoId,
  onCambiarEstablecimiento,
  campanas,
  campanaId,
  onElegirCampana,
}: Props) {
  const ordenadas = [...campanas].sort((a, b) => b.anio - a.anio);
  return (
    <>
      <select
        aria-label="Establecimiento"
        className="planilla-pill"
        value={establecimientoId ?? ''}
        onChange={(e) => onCambiarEstablecimiento(e.target.value)}
        disabled={establecimientos.length === 0}
      >
        {establecimientoId === null && <option value="">Establecimiento</option>}
        {establecimientos.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nombre}
          </option>
        ))}
      </select>
      {ordenadas.length > 0 && (
        <select
          aria-label="Campaña"
          className="planilla-pill"
          value={campanaId ?? ''}
          onChange={(e) => onElegirCampana(e.target.value)}
        >
          {ordenadas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.anio}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
