'use client';

import { useState } from 'react';
import { actualizarCampana, type CampanaCompleta } from '@/services/planilla.service';
import { mensajeDe } from '@/lib/formularios';
import { NOMBRES_MES } from '@/lib/planilla/vista';
import { RANGOS, useCampoNumerico } from '@/lib/planilla/rangos';

interface Props {
  campana: CampanaCompleta;
  onCambio: () => void;
}

export function ParametrosCampana({ campana, onCambio }: Props) {
  const [mes, setMes] = useState(String(campana.mesServicio));
  const campoEficiencia = useCampoNumerico(String(campana.eficienciaCosecha), RANGOS.eficiencia);
  const eficiencia = campoEficiencia.texto;
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState(false);
  const eficienciaOk = campoEficiencia.ok;

  async function guardar() {
    setEnCurso(true);
    setError(null);
    const cambios: { mesServicio?: number; eficienciaCosecha?: number } = { mesServicio: Number(mes) };
    if (eficiencia.trim() !== '') cambios.eficienciaCosecha = Number(eficiencia);
    try {
      await actualizarCampana(campana.id, cambios);
      onCambio();
    } catch (err) {
      setError(mensajeDe(err));
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
            {...campoEficiencia.props}
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
