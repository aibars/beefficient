'use client';

import { useMemo, useState } from 'react';
import { formatearFechaCorta, type CalculoCampana } from '@beefficient/domain';
import type { CampanaCompleta } from '@/services/planilla.service';
import { TEXTO_AVISO, avisosDeFila, type Aviso, type Unidad } from '@/lib/planilla/vista';
import { num } from './formato';

interface Props {
  campana: CampanaCompleta;
  calculo: CalculoCampana;
  unidad: Unidad;
  onAbrir: (pastoreoId: string) => void;
  seleccionado?: string | null;
}

const TODOS = '';

function Marca({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) return null;
  return (
    <span className="planilla-aviso" title={avisos.map((a) => TEXTO_AVISO[a]).join('\n')}>
      !
    </span>
  );
}

export function TablaPastoreos({ campana, calculo, unidad, onAbrir, seleccionado }: Props) {
  const [loteId, setLoteId] = useState(TODOS);
  const [rodeoId, setRodeoId] = useState(TODOS);

  const nombreLote = useMemo(() => new Map(campana.lotes.map((l) => [l.id, l.nombre])), [campana.lotes]);
  const nombreRodeo = useMemo(() => new Map(campana.rodeos.map((r) => [r.id, r.nombre])), [campana.rodeos]);

  // `filas` vienen en el mismo orden que `pastoreos`.
  const filas = useMemo(
    () =>
      campana.pastoreos.map((pastoreo, i) => {
        const fila = calculo.filas[i]!;
        return { pastoreo, fila, avisos: avisosDeFila(fila, pastoreo, campana.pastoreos) };
      }),
    [campana.pastoreos, calculo.filas],
  );

  const visibles = filas.filter(
    ({ pastoreo }) =>
      (loteId === TODOS || pastoreo.loteId === loteId) &&
      (rodeoId === TODOS || pastoreo.rodeoId === rodeoId),
  );

  return (
    <section className="planilla-card">
      <h2 className="planilla-card-titulo">Pastoreos</h2>
      <div className="planilla-filtros">
        <select
          aria-label="Lote"
          className="planilla-pill"
          value={loteId}
          onChange={(e) => setLoteId(e.target.value)}
        >
          <option value={TODOS}>Todos los lotes</option>
          {campana.lotes.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
        <select
          aria-label="Rodeo"
          className="planilla-pill"
          value={rodeoId}
          onChange={(e) => setRodeoId(e.target.value)}
        >
          <option value={TODOS}>Todos los rodeos</option>
          {campana.rodeos.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="planilla-scroll">
        <table className="planilla-tabla">
          <thead>
            <tr>
              <th className="izq">Mes</th>
              <th className="izq">Lote</th>
              <th className="izq">Rodeo</th>
              <th>Cab.</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Días</th>
              <th>EV/cab</th>
              <th>{unidad === 'EV' ? 'EV tot.' : 'kg MS tot.'}</th>
              <th>Raciones</th>
              <th>Rac/ha</th>
              <th>Carga</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(({ pastoreo, fila, avisos }) => {
              const r = unidad === 'EV' ? fila.ev : fila.ms;
              const deCocimano = avisos.filter(
                (a) => a === 'extrapolado' || a === 'fuera-de-tabla' || a === 'ganancia',
              );
              return (
                <tr
                  key={pastoreo.id}
                  className={pastoreo.id === seleccionado ? 'planilla-fila sel' : 'planilla-fila'}
                  tabIndex={0}
                  onClick={() => onAbrir(pastoreo.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onAbrir(pastoreo.id);
                    }
                  }}
                >
                  <td className="izq">{fila.mes ?? '—'}</td>
                  <td className="izq">{pastoreo.loteId ? nombreLote.get(pastoreo.loteId) ?? '—' : '—'}</td>
                  <td className="izq">
                    {pastoreo.rodeoId ? nombreRodeo.get(pastoreo.rodeoId) ?? '—' : '—'}
                    <Marca avisos={avisos.filter((a) => a === 'superpuesto')} />
                  </td>
                  <td>{num(pastoreo.cabezas)}</td>
                  <td>{pastoreo.entrada ? formatearFechaCorta(pastoreo.entrada) : '—'}</td>
                  <td>{pastoreo.salida ? formatearFechaCorta(pastoreo.salida) : '—'}</td>
                  <td className="calc">
                    {num(fila.dias)}
                    <Marca avisos={avisos.filter((a) => a === 'fechas')} />
                  </td>
                  <td className="calc">
                    {num(fila.evPorCabeza, 2)}
                    <Marca avisos={deCocimano} />
                  </td>
                  <td className="calc">{num(r.totales, 1)}</td>
                  <td className="calc">{num(r.raciones)}</td>
                  <td className="calc">{num(r.racionesPorHa)}</td>
                  <td className="calc">{num(r.carga, 2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
