'use client';

import { useMemo, useState } from 'react';
import { TABLA_1, type PastoreoCampana } from '@beefficient/domain';
import {
  actualizarPastoreo,
  borrarPastoreo,
  crearPastoreo,
  type CampanaCompleta,
} from '@/services/planilla.service';
import { calcularBorrador, avisosDeFila, TEXTO_AVISO } from '@/lib/planilla/vista';
import { num, ha, unidadCarga } from '@/components/planilla/formato';

interface Props {
  campana: CampanaCompleta;
  /** null = pastoreo nuevo. */
  pastoreo: PastoreoCampana | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

const ID_BORRADOR = 'borrador';

const FUENTE = { cocimano: 'Cocimano', tabla1: 'Tabla 1' } as const;

const aTexto = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n));
const aNumero = (t: string): number | null => (t.trim() === '' ? null : Number(t));
const aFecha = (t: string): string | null => (t === '' ? null : t);

function mensajeDe(err: unknown): string {
  return err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
}

export function PanelPastoreo({ campana, pastoreo, onCerrar, onGuardado }: Props) {
  const [loteId, setLoteId] = useState(pastoreo?.loteId ?? '');
  const [rodeoId, setRodeoId] = useState(pastoreo?.rodeoId ?? '');
  const [cabezas, setCabezas] = useState(aTexto(pastoreo?.cabezas));
  const [entrada, setEntrada] = useState(pastoreo?.entrada ?? '');
  const [salida, setSalida] = useState(pastoreo?.salida ?? '');
  const [categoria, setCategoria] = useState(pastoreo?.categoriaTabla1Id ?? '');
  const [evManual, setEvManual] = useState(aTexto(pastoreo?.evManual));
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState(false);

  const datos = {
    loteId: loteId || null,
    rodeoId: rodeoId || null,
    cabezas: aNumero(cabezas),
    entrada: aFecha(entrada),
    salida: aFecha(salida),
    categoriaTabla1Id: categoria || null,
    evManual: aNumero(evManual),
  };
  const borrador: PastoreoCampana = { id: pastoreo?.id ?? ID_BORRADOR, ...datos };

  const fila = useMemo(
    () => calcularBorrador(campana, borrador),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [campana, loteId, rodeoId, cabezas, entrada, salida, categoria, evManual],
  );
  const avisos = avisosDeFila(
    fila,
    borrador,
    campana.pastoreos.some((p) => p.id === borrador.id)
      ? campana.pastoreos.map((p) => (p.id === borrador.id ? borrador : p))
      : [...campana.pastoreos, borrador],
  );

  const rodeo = campana.rodeos.find((r) => r.id === rodeoId);
  const mostrarTabla1 = rodeo !== undefined && !rodeo.usaCocimano;
  const opcionesTabla1 = campana.tabla1 ?? TABLA_1;
  const fuente = fila.evEsManual ? 'Manual' : fila.fuenteEv ? FUENTE[fila.fuenteEv] : '—';

  async function ejecutar(accion: () => Promise<unknown>) {
    setEnCurso(true);
    setError(null);
    try {
      await accion();
      onGuardado();
    } catch (err) {
      setError(mensajeDe(err));
    } finally {
      setEnCurso(false);
    }
  }

  const guardar = () =>
    ejecutar(() =>
      pastoreo
        ? actualizarPastoreo(campana.id, pastoreo.id, datos)
        : crearPastoreo(campana.id, datos),
    );
  const eliminar = () => ejecutar(() => borrarPastoreo(campana.id, pastoreo!.id));

  return (
    <>
      <div className="panel-scrim" onClick={onCerrar} />
      <aside className="panel-pastoreo" role="dialog" aria-label="Pastoreo">
        <div className="panel-top">
          <h2 className="panel-titulo">Pastoreo</h2>
          <button type="button" className="panel-cerrar" aria-label="Cerrar" onClick={onCerrar}>
            ✕
          </button>
        </div>

        <label className="panel-campo">
          <span className="panel-etiqueta">Lote</span>
          <select className="panel-input" value={loteId} onChange={(e) => setLoteId(e.target.value)}>
            <option value="" />
            {campana.lotes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre} — {ha(l.hectareas)} ha
              </option>
            ))}
          </select>
        </label>

        <label className="panel-campo">
          <span className="panel-etiqueta">Rodeo</span>
          <select className="panel-input" value={rodeoId} onChange={(e) => setRodeoId(e.target.value)}>
            <option value="" />
            {campana.rodeos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="panel-campo">
          <span className="panel-etiqueta">Cabezas</span>
          <input
            className="panel-input"
            type="number"
            min={1}
            step={1}
            value={cabezas}
            onChange={(e) => setCabezas(e.target.value)}
          />
        </label>

        <div className="panel-fila2">
          <label className="panel-campo">
            <span className="panel-etiqueta">Entrada</span>
            <input
              className="panel-input"
              type="date"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
            />
          </label>
          <label className="panel-campo">
            <span className="panel-etiqueta">Salida</span>
            <input
              className="panel-input"
              type="date"
              value={salida}
              onChange={(e) => setSalida(e.target.value)}
            />
          </label>
        </div>

        {mostrarTabla1 && (
          <label className="panel-campo">
            <span className="panel-etiqueta">Categoría de la Tabla 1</span>
            <select
              className="panel-input"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="" />
              {opcionesTabla1.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="panel-campo">
          <span className="panel-etiqueta">EV manual</span>
          <input
            className="panel-input"
            type="number"
            min={0}
            step="any"
            value={evManual}
            onChange={(e) => setEvManual(e.target.value)}
          />
        </label>

        {avisos.map((a) => (
          <div key={a} className="panel-aviso">
            <span className="planilla-aviso">!</span> {TEXTO_AVISO[a]}
          </div>
        ))}

        <div className="panel-resultados">
          <div className="panel-tile destacado">
            <span className="panel-etiqueta">Raciones</span>
            <b data-testid="raciones">{num(fila.ev.raciones)}</b>
          </div>
          <div className="panel-tile">
            <span className="panel-etiqueta">Días</span>
            <b data-testid="dias">{num(fila.dias)}</b>
          </div>
          <div className="panel-tile">
            <span className="panel-etiqueta">EV/cab</span>
            <b>{num(fila.evPorCabeza, 2)}</b>
            <span className="panel-etiqueta" data-testid="fuente-ev">
              {fuente}
            </span>
          </div>
          <div className="panel-tile">
            <span className="panel-etiqueta">Carga</span>
            <b>
              {num(fila.ev.carga, 2)} {unidadCarga('EV')}
            </b>
          </div>
        </div>

        {error && (
          <p className="panel-error" role="alert">
            {error}
          </p>
        )}

        <div className="panel-acciones">
          {pastoreo && (
            <button type="button" className="panel-eliminar" disabled={enCurso} onClick={eliminar}>
              Eliminar
            </button>
          )}
          <button type="button" className="planilla-boton" disabled={enCurso} onClick={guardar}>
            Guardar
          </button>
        </div>
      </aside>
    </>
  );
}
