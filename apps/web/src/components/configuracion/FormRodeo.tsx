'use client';

import { useState } from 'react';
import {
  CATEGORIAS_RODEO,
  DURACIONES_SERVICIO,
  type CategoriaRodeo,
  type DuracionServicio,
  type RodeoCampana,
} from '@beefficient/domain';
import { actualizarRodeo, crearRodeo } from '@/services/planilla.service';
import { NOMBRES_MES } from '@/lib/planilla/vista';

interface Props {
  campanaId: string;
  /** null = rodeo nuevo. */
  rodeo: RodeoCampana | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

const aTexto = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n));
const aNumero = (t: string): number | null => (t.trim() === '' ? null : Number(t));

function mensajeDe(err: unknown): string {
  return err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
}

export function FormRodeo({ campanaId, rodeo, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre] = useState(rodeo?.nombre ?? '');
  const [categoria, setCategoria] = useState<string>(rodeo?.categoria ?? '');
  const [pesoVivo, setPesoVivo] = useState(aTexto(rodeo?.pesoVivo));
  const [ganancia, setGanancia] = useState<string[]>(
    Array.from({ length: 12 }, (_, i) => aTexto(rodeo?.ganancia[i])),
  );
  const [inicio, setInicio] = useState(rodeo?.inicioServicio ?? '');
  const [duracion, setDuracion] = useState(String(rodeo?.duracionServicio ?? 90));
  const [destete, setDestete] = useState(rodeo?.destete ?? '');
  const [cocimano, setCocimano] = useState(rodeo?.usaCocimano ?? true);
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState(false);

  async function guardar() {
    setEnCurso(true);
    setError(null);
    const cuerpo = {
      nombre: nombre.trim(),
      categoria: (categoria || null) as CategoriaRodeo | null,
      pesoVivo: aNumero(pesoVivo),
      ganancia: ganancia.map(aNumero),
      inicioServicio: inicio || null,
      duracionServicio: Number(duracion) as DuracionServicio,
      destete: destete || null,
      usaCocimano: cocimano,
    };
    try {
      if (rodeo) await actualizarRodeo(campanaId, rodeo.id, cuerpo);
      else await crearRodeo(campanaId, cuerpo);
      onGuardado();
    } catch (err) {
      setError(mensajeDe(err));
    } finally {
      setEnCurso(false);
    }
  }

  return (
    <form
      className="config-form"
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <div className="config-form-grilla">
        <label className="panel-campo">
          <span className="panel-etiqueta">Nombre</span>
          <input className="panel-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <label className="panel-campo">
          <span className="panel-etiqueta">Categoría</span>
          <select className="panel-input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="" />
            {CATEGORIAS_RODEO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="panel-campo">
          <span className="panel-etiqueta">Peso vivo (kg)</span>
          <input
            className="panel-input"
            type="number"
            min={0}
            max={99999.99}
            step="any"
            value={pesoVivo}
            onChange={(e) => setPesoVivo(e.target.value)}
          />
        </label>
        <label className="panel-campo">
          <span className="panel-etiqueta">Inicio del servicio</span>
          <input className="panel-input" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </label>
        <label className="panel-campo">
          <span className="panel-etiqueta">Duración del servicio</span>
          <select className="panel-input" value={duracion} onChange={(e) => setDuracion(e.target.value)}>
            {DURACIONES_SERVICIO.map((d) => (
              <option key={d} value={d}>
                {d} días
              </option>
            ))}
          </select>
        </label>
        <label className="panel-campo">
          <span className="panel-etiqueta">Destete</span>
          <input className="panel-input" type="date" value={destete} onChange={(e) => setDestete(e.target.value)} />
        </label>
        <label className="config-check">
          <input type="checkbox" checked={cocimano} onChange={(e) => setCocimano(e.target.checked)} />
          <span className="panel-etiqueta">Cocimano</span>
        </label>
      </div>

      <span className="panel-etiqueta">Ganancia por mes (g/día)</span>
      <div className="config-ganancia">
        {NOMBRES_MES.map((mes, i) => (
          <label key={mes} className="panel-campo">
            <span className="panel-etiqueta">{mes.slice(0, 3)}</span>
            <input
              className="panel-input"
              aria-label={`Ganancia ${mes}`}
              type="number"
              step="any"
              value={ganancia[i]}
              onChange={(e) => setGanancia((g) => g.map((v, j) => (j === i ? e.target.value : v)))}
            />
          </label>
        ))}
      </div>

      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}
      <div className="config-acciones">
        <button type="button" className="panel-eliminar" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="planilla-boton" disabled={enCurso || nombre.trim() === ''}>
          Guardar
        </button>
      </div>
    </form>
  );
}
