'use client';

import { useState } from 'react';
import type { RodeoCampana } from '@beefficient/domain';
import { borrarRodeo, type CampanaCompleta } from '@/services/planilla.service';
import { num } from '@/components/planilla/formato';
import { FormRodeo } from './FormRodeo';

interface Props {
  campana: CampanaCompleta;
  onCambio: () => void;
}

/** Valor de `abierto` para un rodeo nuevo. */
const NUEVO = 'nuevo';

export function RodeosCampana({ campana, onCambio }: Props) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editado = campana.rodeos.find((r) => r.id === abierto) ?? null;

  async function borrar(r: RodeoCampana) {
    setError(null);
    try {
      await borrarRodeo(campana.id, r.id);
      onCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    }
  }

  return (
    <section className="planilla-card">
      <div className="config-titulo">
        <h2 className="planilla-card-titulo">Rodeos · {campana.anio}</h2>
        <button type="button" className="planilla-boton" onClick={() => setAbierto(NUEVO)}>
          + Rodeo
        </button>
      </div>
      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}
      <div className="planilla-scroll">
        <table className="planilla-tabla">
          <thead>
            <tr>
              <th className="izq">Rodeo</th>
              <th className="izq">Categoría</th>
              <th>PV kg</th>
              <th>Servicio</th>
              <th>Cocimano</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {campana.rodeos.map((r) => (
              <tr key={r.id}>
                <td className="izq">{r.nombre}</td>
                <td className="izq">{r.categoria ?? '—'}</td>
                <td>{num(r.pesoVivo)}</td>
                <td>{r.duracionServicio} días</td>
                <td>{r.usaCocimano ? 'Sí' : 'No'}</td>
                <td className="config-celda-acciones">
                  <button type="button" className="config-link" onClick={() => setAbierto(r.id)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="config-link"
                    aria-label={`Borrar ${r.nombre}`}
                    onClick={() => void borrar(r)}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {abierto !== null && (abierto === NUEVO || editado) && (
        <FormRodeo
          key={abierto}
          campanaId={campana.id}
          rodeo={editado}
          onCancelar={() => setAbierto(null)}
          onGuardado={() => {
            setAbierto(null);
            onCambio();
          }}
        />
      )}
    </section>
  );
}
