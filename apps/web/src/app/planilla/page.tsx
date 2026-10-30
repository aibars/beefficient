'use client';

import { useCallback, useEffect, useState } from 'react';
import { AsyncState } from '@/components/AsyncState';
import { EncabezadoCampana } from '@/components/planilla/EncabezadoCampana';
import { TotalesCampana } from '@/components/planilla/TotalesCampana';
import { CargaPorMes } from '@/components/planilla/CargaPorMes';
import { TablaPorLote } from '@/components/planilla/TablaPorLote';
import { CabezasPorRodeo } from '@/components/planilla/CabezasPorRodeo';
import { TablaPastoreos } from '@/components/planilla/TablaPastoreos';
import { PanelPastoreo } from '@/components/planilla/PanelPastoreo';
import { usePlanilla } from '@/hooks/usePlanilla';
import { resultadosEn, type Unidad } from '@/lib/planilla/vista';

/** Valor de `pastoreoAbierto` para un pastoreo nuevo. */
const NUEVO = 'nuevo';

export default function PlanillaPage() {
  const planilla = usePlanilla();
  const { campana, calculo, campanas, loading, error } = planilla;
  const [unidad, setUnidad] = useState<Unidad>('EV');
  // Pastoreo abierto en el panel (Tarea 11): un id, NUEVO o null.
  const [pastoreoAbierto, setPastoreoAbierto] = useState<string | null>(null);
  const cerrarPastoreo = useCallback(() => setPastoreoAbierto(null), []);
  const onAbrirPastoreo = (id: string | null) => setPastoreoAbierto(id ?? NUEVO);

  // Si el pastoreo abierto ya no está en la campaña (refresco), se cierra.
  const pastoreoEditado =
    pastoreoAbierto === null || pastoreoAbierto === NUEVO
      ? null
      : campana?.pastoreos.find((p) => p.id === pastoreoAbierto) ?? null;
  const faltaEditado =
    pastoreoAbierto !== null && pastoreoAbierto !== NUEVO && campana !== null && !pastoreoEditado;
  useEffect(() => {
    if (faltaEditado) setPastoreoAbierto(null);
  }, [faltaEditado]);

  const anioActual = new Date().getFullYear();
  const resultados = calculo ? resultadosEn(calculo, unidad) : null;
  const sinCampanas = !loading && !error && campanas.length === 0;

  return (
    <div className="page-planilla">
      <EncabezadoCampana
        titulo={campana ? `Campaña ${campana.anio}` : 'Planilla'}
        establecimientos={planilla.establecimientos}
        establecimientoId={planilla.establecimientoId}
        onCambiarEstablecimiento={(id) => {
          setPastoreoAbierto(null);
          void planilla.cambiarEstablecimiento(id);
        }}
        campanas={campanas}
        campanaId={planilla.campanaId}
        onElegirCampana={(id) => {
          setPastoreoAbierto(null);
          void planilla.elegirCampana(id);
        }}
        unidad={unidad}
        onUnidad={setUnidad}
        onNuevoPastoreo={campana ? () => onAbrirPastoreo(null) : null}
      />

      <AsyncState loading={loading} error={error} onRetry={planilla.retry} />

      {sinCampanas && (
        <div className="planilla-card planilla-vacio">
          <h2 className="planilla-card-titulo">Sin campañas</h2>
          <button
            type="button"
            className="planilla-boton"
            onClick={() => void planilla.crearCampanaDelAnio()}
          >
            Crear campaña {anioActual}
          </button>
        </div>
      )}

      {!loading && campana && calculo && resultados && (
        <>
          <TotalesCampana
            resultados={resultados}
            unidad={unidad}
            cantidadLotes={campana.lotes.length}
            mesServicio={campana.mesServicio}
          />
          {resultados.hayDatos && (
            <>
              <div className="planilla-grilla">
                <CargaPorMes resultados={resultados} unidad={unidad} />
                <TablaPorLote resultados={resultados} lotes={campana.lotes} />
              </div>
              <CabezasPorRodeo resultados={resultados} rodeos={campana.rodeos} />
            </>
          )}
          <TablaPastoreos
            campana={campana}
            calculo={calculo}
            unidad={unidad}
            onAbrir={onAbrirPastoreo}
            seleccionado={pastoreoAbierto}
          />
          {pastoreoAbierto !== null && !faltaEditado && (
            <PanelPastoreo
              key={pastoreoAbierto}
              campana={campana}
              pastoreo={pastoreoEditado}
              onCerrar={cerrarPastoreo}
              onGuardado={() => {
                setPastoreoAbierto(null);
                void planilla.recargar();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
