'use client';

import { AsyncState } from '@/components/AsyncState';
import { PotrerosYLotes } from '@/components/configuracion/PotrerosYLotes';
import { RodeosCampana } from '@/components/configuracion/RodeosCampana';
import { ParametrosCampana } from '@/components/configuracion/ParametrosCampana';
import { SelectoresCampana } from '@/components/planilla/SelectoresCampana';
import { usePlanilla } from '@/hooks/usePlanilla';

export default function ConfiguracionPage() {
  const planilla = usePlanilla();
  const { campana, campanas, loading, error } = planilla;
  const recargar = () => void planilla.recargar();

  return (
    <div className="page-planilla">
      <header className="planilla-encabezado">
        <h1 className="planilla-titulo">Configuración</h1>
        <SelectoresCampana
          establecimientos={planilla.establecimientos}
          establecimientoId={planilla.establecimientoId}
          onCambiarEstablecimiento={(id) => void planilla.cambiarEstablecimiento(id)}
          campanas={campanas}
          campanaId={planilla.campanaId}
          onElegirCampana={(id) => void planilla.elegirCampana(id)}
        />
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
