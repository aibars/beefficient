'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  actualizarLote,
  actualizarPotrero,
  borrarLote,
  borrarPotrero,
  crearLote,
  crearPotrero,
  listarLotes,
  listarPotreros,
  type Lote,
  type Potrero,
} from '@/services/planilla.service';
import { ha } from '@/components/planilla/formato';
import { BotonBorrar } from '@/components/BotonBorrar';
import { enRango, RANGOS } from '@/lib/planilla/rangos';

interface Props {
  /** Avisa que cambiaron lotes o potreros (la campaña los usa). */
  onCambio: () => void;
}

type Abierto = { tipo: 'lote'; lote: Lote | null } | { tipo: 'potrero'; potrero: Potrero | null } | null;

const aTexto = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n));
const aNumero = (t: string): number | null => (t.trim() === '' ? null : Number(t));
const mensajeDe = (err: unknown) => (err instanceof Error ? err.message : 'Ocurrió un error inesperado.');

export function PotrerosYLotes({ onCambio }: Props) {
  const [potreros, setPotreros] = useState<Potrero[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [abierto, setAbierto] = useState<Abierto>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [p, l] = await Promise.all([listarPotreros(), listarLotes()]);
      setPotreros(p);
      setLotes(l);
    } catch (err) {
      setError(mensajeDe(err));
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function correr(accion: () => Promise<unknown>) {
    setError(null);
    try {
      await accion();
      setAbierto(null);
      await cargar();
      onCambio();
    } catch (err) {
      setError(mensajeDe(err));
    }
  }

  return (
    <section className="planilla-card">
      <div className="config-titulo">
        <h2 className="planilla-card-titulo">Potreros y lotes</h2>
        <div className="config-acciones">
          <button type="button" className="planilla-boton" onClick={() => setAbierto({ tipo: 'potrero', potrero: null })}>
            + Potrero
          </button>
          <button type="button" className="planilla-boton" onClick={() => setAbierto({ tipo: 'lote', lote: null })}>
            + Lote
          </button>
        </div>
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
              <th className="izq">Lote</th>
              <th className="izq">Potrero</th>
              <th>ha</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lotes.map((l) => (
              <tr key={l.id}>
                <td className="izq">{l.nombre}</td>
                <td className="izq">{potreros.find((p) => p.id === l.potreroId)?.nombre ?? '—'}</td>
                <td>{ha(l.hectareas)}</td>
                <td className="config-celda-acciones">
                  <button type="button" className="config-link" onClick={() => setAbierto({ tipo: 'lote', lote: l })}>
                    Editar
                  </button>
                  <BotonBorrar
                    etiqueta={`Borrar ${l.nombre}`}
                    onConfirmar={() => void correr(() => borrarLote(l.id))}
                  >
                    Borrar
                  </BotonBorrar>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="planilla-scroll">
        <table className="planilla-tabla">
          <thead>
            <tr>
              <th className="izq">Potrero</th>
              <th>ha</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {potreros.map((p) => (
              <tr key={p.id}>
                <td className="izq">{p.nombre}</td>
                <td>{ha(p.hectareas)}</td>
                <td className="config-celda-acciones">
                  <button type="button" className="config-link" onClick={() => setAbierto({ tipo: 'potrero', potrero: p })}>
                    Editar
                  </button>
                  <BotonBorrar
                    etiqueta={`Borrar potrero ${p.nombre}`}
                    onConfirmar={() => void correr(() => borrarPotrero(p.id))}
                  >
                    Borrar
                  </BotonBorrar>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {abierto?.tipo === 'lote' && (
        <FormLote
          key={abierto.lote?.id ?? 'nuevo-lote'}
          lote={abierto.lote}
          potreros={potreros}
          onCancelar={() => setAbierto(null)}
          onGuardar={(d) =>
            correr(() => (abierto.lote ? actualizarLote(abierto.lote.id, d) : crearLote(d)))
          }
        />
      )}
      {abierto?.tipo === 'potrero' && (
        <FormPotrero
          key={abierto.potrero?.id ?? 'nuevo-potrero'}
          potrero={abierto.potrero}
          onCancelar={() => setAbierto(null)}
          onGuardar={(d) =>
            correr(() => (abierto.potrero ? actualizarPotrero(abierto.potrero.id, d) : crearPotrero(d)))
          }
        />
      )}
    </section>
  );
}

function FormLote({
  lote,
  potreros,
  onCancelar,
  onGuardar,
}: {
  lote: Lote | null;
  potreros: readonly Potrero[];
  onCancelar: () => void;
  onGuardar: (d: { nombre: string; hectareas: number | null; potreroId: string | null }) => void;
}) {
  const [nombre, setNombre] = useState(lote?.nombre ?? '');
  const [hectareas, setHectareas] = useState(aTexto(lote?.hectareas));
  const [potreroId, setPotreroId] = useState(lote?.potreroId ?? '');
  const hectareasOk = enRango(hectareas, RANGOS.hectareas);

  function elegirPotrero(id: string) {
    const anterior = potreros.find((p) => p.id === potreroId);
    const nuevo = potreros.find((p) => p.id === id);
    // Se completa con las del potrero si estaba vacío o tenía las del potrero anterior.
    if (nuevo && (hectareas === '' || (anterior && hectareas === String(anterior.hectareas)))) {
      setHectareas(String(nuevo.hectareas));
    }
    setPotreroId(id);
  }

  return (
    <form
      className="config-form"
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar({ nombre: nombre.trim(), hectareas: aNumero(hectareas), potreroId: potreroId || null });
      }}
    >
      <div className="config-form-grilla">
        <label className="panel-campo">
          <span className="panel-etiqueta">Nombre</span>
          <input className="panel-input" aria-label="Nombre del lote" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <label className="panel-campo">
          <span className="panel-etiqueta">Potrero</span>
          <select className="panel-input" aria-label="Potrero del lote" value={potreroId} onChange={(e) => elegirPotrero(e.target.value)}>
            <option value="" />
            {potreros.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="panel-campo">
          <span className="panel-etiqueta">Hectáreas</span>
          <input
            className="panel-input"
            aria-label="Hectáreas del lote"
            type="number"
            {...RANGOS.hectareas}
            aria-invalid={!hectareasOk}
            value={hectareas}
            onChange={(e) => setHectareas(e.target.value)}
          />
        </label>
      </div>
      <div className="config-acciones">
        <button type="button" className="panel-eliminar" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="planilla-boton" aria-label="Guardar lote" disabled={nombre.trim() === '' || !hectareasOk}>
          Guardar
        </button>
      </div>
    </form>
  );
}

function FormPotrero({
  potrero,
  onCancelar,
  onGuardar,
}: {
  potrero: Potrero | null;
  onCancelar: () => void;
  onGuardar: (d: { nombre: string; hectareas: number }) => void;
}) {
  const [nombre, setNombre] = useState(potrero?.nombre ?? '');
  const [hectareas, setHectareas] = useState(aTexto(potrero?.hectareas));
  const hectareasOk = enRango(hectareas, RANGOS.hectareas);

  return (
    <form
      className="config-form"
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar({ nombre: nombre.trim(), hectareas: Number(hectareas) });
      }}
    >
      <div className="config-form-grilla">
        <label className="panel-campo">
          <span className="panel-etiqueta">Nombre</span>
          <input className="panel-input" aria-label="Nombre del potrero" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <label className="panel-campo">
          <span className="panel-etiqueta">Hectáreas</span>
          <input
            className="panel-input"
            aria-label="Hectáreas del potrero"
            type="number"
            {...RANGOS.hectareas}
            aria-invalid={!hectareasOk}
            value={hectareas}
            onChange={(e) => setHectareas(e.target.value)}
          />
        </label>
      </div>
      <div className="config-acciones">
        <button type="button" className="panel-eliminar" onClick={onCancelar}>
          Cancelar
        </button>
        <button
          type="submit"
          className="planilla-boton"
          aria-label="Guardar potrero"
          disabled={nombre.trim() === '' || hectareas.trim() === '' || !hectareasOk}
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
