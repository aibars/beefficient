'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  ERROR_CALCULO,
  TEXTO_AVISO,
  type Unidad,
} from '@/lib/planilla/vista';
import { RANGOS, useCampoNumerico } from '@/lib/planilla/rangos';
import { num, ha, unidadCarga } from '@/components/planilla/formato';
import { BotonBorrar } from '@/components/BotonBorrar';
import { aNumero, aTexto, mensajeDe } from '@/lib/formularios';

interface Props {
  campana: CampanaCompleta;
  /** null = pastoreo nuevo. */
  pastoreo: PastoreoCampana | null;
  /** La unidad de la página: Raciones y Carga se muestran en EV o en kg MS. */
  unidad: Unidad;
  /** Dónde va el foco al cerrar si quien abrió el panel ya no está (p. ej. el botón «+ Pastoreo»). */
  volverA?: () => HTMLElement | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

const ID_BORRADOR = 'borrador';

const FOCALIZABLES = 'button:not([disabled]), select:not([disabled]), input:not([disabled])';

const FUENTE = { cocimano: 'Cocimano', tabla1: 'Tabla 1' } as const;

const aFecha = (t: string): string | null => (t === '' ? null : t);

export function PanelPastoreo({ campana, pastoreo, unidad, volverA, onCerrar, onGuardado }: Props) {
  const [loteId, setLoteId] = useState(pastoreo?.loteId ?? '');
  const [rodeoId, setRodeoId] = useState(pastoreo?.rodeoId ?? '');
  const campoCabezas = useCampoNumerico(aTexto(pastoreo?.cabezas), RANGOS.cabezas);
  const campoEv = useCampoNumerico(aTexto(pastoreo?.evManual), RANGOS.evManual);
  const cabezas = campoCabezas.texto;
  const evManual = campoEv.texto;
  const [entrada, setEntrada] = useState(pastoreo?.entrada ?? '');
  const [salida, setSalida] = useState(pastoreo?.salida ?? '');
  const [categoria, setCategoria] = useState(pastoreo?.categoriaTabla1Id ?? '');
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

  // Foco: entra al primer campo y, al cerrar, vuelve a quien abrió el panel; si ese elemento ya
  // no sirve (se borró la fila, o el foco estaba en body) va al destino que pasa la página.
  const panel = useRef<HTMLElement>(null);
  const eliminado = useRef(false);
  const destino = useRef(volverA);
  destino.current = volverA;
  useEffect(() => {
    const abridor = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.querySelector<HTMLElement>('select, input')?.focus();
    return () => {
      const sirve =
        !eliminado.current && abridor !== null && abridor !== document.body && abridor.isConnected;
      (sirve ? abridor : destino.current?.() ?? abridor)?.focus();
    };
  }, []);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
      if (e.key !== 'Tab') return;
      const lista = Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCALIZABLES) ?? []);
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      if (!primero || !ultimo) return;
      const activo = document.activeElement;
      if (!panel.current?.contains(activo)) {
        e.preventDefault();
        (panel.current?.querySelector<HTMLElement>('select, input') ?? primero).focus();
      } else if (e.shiftKey && activo === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
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

  // Si el motor lanza, el panel queda sin resultados y con el mensaje.
  const fila = useMemo(() => {
    try {
      return calcularBorrador(campana, borrador);
    } catch {
      return null;
    }
  }, [campana, borrador]);
  const indicadores = fila ? (unidad === 'EV' ? fila.ev : fila.ms) : null;
  const cabezasOk = campoCabezas.ok;
  const evManualOk = campoEv.ok;
  const avisos = fila ? avisosDeFila(fila, borrador, conBorrador(campana.pastoreos, borrador)) : [];

  const rodeo = campana.rodeos.find((r) => r.id === rodeoId);
  const mostrarTabla1 = rodeo !== undefined && !rodeo.usaCocimano;
  const opcionesTabla1 = campana.tabla1 ?? TABLA_1;
  const fuente = fila?.evEsManual ? 'Manual' : fila?.fuenteEv ? FUENTE[fila.fuenteEv] : '—';

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
  const eliminar = () =>
    ejecutar(async () => {
      await borrarPastoreo(campanaId, idEditado!);
      eliminado.current = true;
    });

  return (
    <>
      <div className="panel-scrim" aria-hidden="true" onClick={onCerrar} />
      <aside
        ref={panel}
        className="panel-pastoreo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-pastoreo-titulo"
      >
        <div className="panel-top">
          <h2 id="panel-pastoreo-titulo" className="panel-titulo">
            Pastoreo
          </h2>
          <button type="button" className="panel-cerrar" aria-label="Cerrar" onClick={onCerrar}>
            ✕
          </button>
        </div>

        <label className="panel-campo">
          <span className="panel-etiqueta">Lote</span>
          <select className="panel-input" value={loteId} onChange={(e) => setLoteId(e.target.value)}>
            <option value="">—</option>
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
            <option value="">—</option>
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
            {...campoCabezas.props}
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
              <option value="">—</option>
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
            {...campoEv.props}
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
            <b data-testid="raciones">{num(indicadores?.raciones ?? null)}</b>
          </div>
          <div className="panel-tile">
            <span className="panel-etiqueta">Días</span>
            <b data-testid="dias">{num(fila?.dias ?? null)}</b>
          </div>
          <div className="panel-tile">
            <span className="panel-etiqueta">EV/cab</span>
            <b>{num(fila?.evPorCabeza ?? null, 2)}</b>
            <span className="panel-etiqueta" data-testid="fuente-ev">
              {fuente}
            </span>
          </div>
          <div className="panel-tile">
            <span className="panel-etiqueta">Carga</span>
            <b data-testid="carga">
              {num(indicadores?.carga ?? null, 2)} {unidadCarga(unidad)}
            </b>
          </div>
        </div>

        {(error ?? (fila ? null : ERROR_CALCULO)) && (
          <p className="panel-error" role="alert">
            {error ?? ERROR_CALCULO}
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
