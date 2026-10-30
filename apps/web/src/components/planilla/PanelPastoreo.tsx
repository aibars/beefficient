'use client';

import { useEffect, useMemo, useState } from 'react';
import { TABLA_1, type PastoreoCampana } from '@beefficient/domain';
import {
  actualizarPastoreo,
  borrarPastoreo,
  crearPastoreo,
  type CampanaCompleta,
} from '@/services/planilla.service';
import {
  calcularBorrador,
  avisosDeFila,
  conBorrador,
  TEXTO_AVISO,
  type Unidad,
} from '@/lib/planilla/vista';
import { enRango, RANGOS } from '@/lib/planilla/rangos';
import { num, ha, unidadCarga } from '@/components/planilla/formato';
import { BotonBorrar } from '@/components/BotonBorrar';

interface Props {
  campana: CampanaCompleta;
  /** null = pastoreo nuevo. */
  pastoreo: PastoreoCampana | null;
  /** La unidad de la página: Raciones y Carga se muestran en EV o en kg MS. */
  unidad: Unidad;
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

export function PanelPastoreo({ campana, pastoreo, unidad, onCerrar, onGuardado }: Props) {
  const [loteId, setLoteId] = useState(pastoreo?.loteId ?? '');
  const [rodeoId, setRodeoId] = useState(pastoreo?.rodeoId ?? '');
  const [cabezas, setCabezas] = useState(aTexto(pastoreo?.cabezas));
  const [entrada, setEntrada] = useState(pastoreo?.entrada ?? '');
  const [salida, setSalida] = useState(pastoreo?.salida ?? '');
  const [categoria, setCategoria] = useState(pastoreo?.categoriaTabla1Id ?? '');
  const [evManual, setEvManual] = useState(aTexto(pastoreo?.evManual));
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState(false);

  // Qué se edita y en qué campaña se fija al abrir: un refresco no lo cambia.
  const [campanaId] = useState(campana.id);
  const [idEditado] = useState(pastoreo?.id ?? null);

  // Si el pastoreo editado desaparece tras un refresco, no se puede guardar: se cierra.
  const desaparecio = idEditado !== null && pastoreo === null;
  useEffect(() => {
    if (desaparecio) onCerrar();
  }, [desaparecio, onCerrar]);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [onCerrar]);

  const datos = useMemo(
    () => ({
      loteId: loteId || null,
      rodeoId: rodeoId || null,
      cabezas: aNumero(cabezas),
      entrada: aFecha(entrada),
      salida: aFecha(salida),
      categoriaTabla1Id: categoria || null,
      evManual: aNumero(evManual),
    }),
    [loteId, rodeoId, cabezas, entrada, salida, categoria, evManual],
  );
  const borrador = useMemo<PastoreoCampana>(
    () => ({ id: idEditado ?? ID_BORRADOR, ...datos }),
    [idEditado, datos],
  );

  const fila = useMemo(() => calcularBorrador(campana, borrador), [campana, borrador]);
  const indicadores = unidad === 'EV' ? fila.ev : fila.ms;
  const cabezasOk = enRango(cabezas, RANGOS.cabezas);
  const evManualOk = enRango(evManual, RANGOS.evManual);
  const avisos = avisosDeFila(fila, borrador, conBorrador(campana.pastoreos, borrador));

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
      idEditado
        ? actualizarPastoreo(campanaId, idEditado, datos)
        : crearPastoreo(campanaId, datos),
    );
  const eliminar = () => ejecutar(() => borrarPastoreo(campanaId, idEditado!));

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
            {...RANGOS.cabezas}
            aria-invalid={!cabezasOk}
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
            {...RANGOS.evManual}
            aria-invalid={!evManualOk}
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
            <b data-testid="raciones">{num(indicadores.raciones)}</b>
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
            <b data-testid="carga">
              {num(indicadores.carga, 2)} {unidadCarga(unidad)}
            </b>
          </div>
        </div>

        {error && (
          <p className="panel-error" role="alert">
            {error}
          </p>
        )}

        <div className="panel-acciones">
          {idEditado && (
            <BotonBorrar className="panel-eliminar" disabled={enCurso} onConfirmar={() => void eliminar()}>
              Eliminar
            </BotonBorrar>
          )}
          <button
            type="button"
            className="planilla-boton"
            disabled={enCurso || !cabezasOk || !evManualOk}
            onClick={guardar}
          >
            Guardar
          </button>
        </div>
      </aside>
    </>
  );
}
