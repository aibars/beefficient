'use client';

import { AsyncState } from '@/components/AsyncState';
import { PotrerosYLotes } from '@/components/configuracion/PotrerosYLotes';
import { RodeosCampana } from '@/components/configuracion/RodeosCampana';
import { ParametrosCampana } from '@/components/configuracion/ParametrosCampana';
import { usePlanilla } from '@/hooks/usePlanilla';

export default function ConfiguracionPage() {
  const planilla = usePlanilla();
  const { campana, campanas, loading, error } = planilla;
  const ordenadas = [...campanas].sort((a, b) => b.anio - a.anio);
  const recargar = () => void planilla.recargar();

  return (
    <div className="page-planilla">
      <header className="planilla-encabezado">
        <h1 className="planilla-titulo">Configuración</h1>
        <select
          aria-label="Establecimiento"
          className="planilla-pill"
          value={planilla.establecimientoId ?? ''}
          onChange={(e) => void planilla.cambiarEstablecimiento(e.target.value)}
          disabled={planilla.establecimientos.length === 0}
        >
          {planilla.establecimientoId === null && <option value="">Establecimiento</option>}
          {planilla.establecimientos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
        {ordenadas.length > 0 && (
          <select
            aria-label="Campaña"
            className="planilla-pill"
            value={planilla.campanaId ?? ''}
            onChange={(e) => void planilla.elegirCampana(e.target.value)}
          >
            {ordenadas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.anio}
              </option>
            ))}
          </select>
        )}
      </header>

      <AsyncState loading={loading} error={error} onRetry={planilla.retry} />

      {!loading && <PotrerosYLotes onCambio={recargar} />}
      {!loading && campana && (
        <>
          <RodeosCampana key={`r-${campana.id}`} campana={campana} onCambio={recargar} />
          <ParametrosCampana key={`p-${campana.id}-${campana.mesServicio}-${campana.eficienciaCosecha}`} campana={campana} onCambio={recargar} />
        </>
      )}
    </div>
  );
}
