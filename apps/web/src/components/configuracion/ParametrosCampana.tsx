'use client';

import { useState } from 'react';
import { actualizarCampana, type CampanaCompleta } from '@/services/planilla.service';
import { NOMBRES_MES } from '@/lib/planilla/vista';
import { enRango, RANGOS } from '@/lib/planilla/rangos';

interface Props {
  campana: CampanaCompleta;
  onCambio: () => void;
}

export function ParametrosCampana({ campana, onCambio }: Props) {
  const [mes, setMes] = useState(String(campana.mesServicio));
  const [eficiencia, setEficiencia] = useState(String(campana.eficienciaCosecha));
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState(false);
  const eficienciaOk = enRango(eficiencia, RANGOS.eficiencia);

  async function guardar() {
    setEnCurso(true);
    setError(null);
    const cambios: { mesServicio?: number; eficienciaCosecha?: number } = { mesServicio: Number(mes) };
    if (eficiencia.trim() !== '') cambios.eficienciaCosecha = Number(eficiencia);
    try {
      await actualizarCampana(campana.id, cambios);
      onCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setEnCurso(false);
    }
  }

  return (
    <section className="planilla-card">
      <h2 className="planilla-card-titulo">Campaña {campana.anio}</h2>
      <div className="config-form-grilla">
        <label className="panel-campo">
          <span className="panel-etiqueta">Mes de servicio</span>
          <select className="panel-input" value={mes} onChange={(e) => setMes(e.target.value)}>
            {NOMBRES_MES.map((n, i) => (
              <option key={n} value={i + 1}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="panel-campo">
          <span className="panel-etiqueta">Eficiencia de cosecha (%)</span>
          <input
            className="panel-input"
            type="number"
            {...RANGOS.eficiencia}
            aria-invalid={!eficienciaOk}
            value={eficiencia}
            onChange={(e) => setEficiencia(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}
      <div className="config-acciones">
        <button type="button" className="planilla-boton" disabled={enCurso || !eficienciaOk} onClick={() => void guardar()}>
          Guardar
        </button>
      </div>
    </section>
  );
}
