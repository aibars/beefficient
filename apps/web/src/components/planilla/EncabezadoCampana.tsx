'use client';

import type { CampanaResumen } from '@/services/planilla.service';
import type { Establecimiento } from '@/services/farms.service';
import type { Unidad } from '@/lib/planilla/vista';
import { SelectoresCampana } from '@/components/planilla/SelectoresCampana';

interface Props {
  titulo: string;
  establecimientos: readonly Establecimiento[];
  establecimientoId: string | null;
  onCambiarEstablecimiento: (id: string) => void;
  campanas: readonly CampanaResumen[];
  campanaId: string | null;
  onElegirCampana: (id: string) => void;
  unidad: Unidad;
  onUnidad: (unidad: Unidad) => void;
  /** null = sin campaña: el botón queda deshabilitado. */
  onNuevoPastoreo: (() => void) | null;
}

const UNIDADES: { valor: Unidad; etiqueta: string }[] = [
  { valor: 'EV', etiqueta: 'EV' },
  { valor: 'MS', etiqueta: 'kg MS' },
];

export function EncabezadoCampana({
  titulo,
  establecimientos,
  establecimientoId,
  onCambiarEstablecimiento,
  campanas,
  campanaId,
  onElegirCampana,
  unidad,
  onUnidad,
  onNuevoPastoreo,
}: Props) {
  return (
    <header className="planilla-encabezado">
      <h1 className="planilla-titulo">{titulo}</h1>
      <SelectoresCampana
        establecimientos={establecimientos}
        establecimientoId={establecimientoId}
        onCambiarEstablecimiento={onCambiarEstablecimiento}
        campanas={campanas}
        campanaId={campanaId}
        onElegirCampana={onElegirCampana}
      />
      <div className="planilla-segmentado" role="group" aria-label="Unidad">
        {UNIDADES.map((u) => (
          <button
            key={u.valor}
            type="button"
            aria-pressed={unidad === u.valor}
            className={unidad === u.valor ? 'activo' : undefined}
            onClick={() => onUnidad(u.valor)}
          >
            {u.etiqueta}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="planilla-boton"
        onClick={onNuevoPastoreo ?? undefined}
        disabled={!onNuevoPastoreo}
      >
        + Pastoreo
      </button>
    </header>
  );
}
