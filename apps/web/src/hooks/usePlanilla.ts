'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calcularCampana, type CalculoCampana } from '@beefficient/domain';
import {
  crearCampana,
  listarCampanas,
  obtenerCampana,
  type CampanaCompleta,
  type CampanaResumen,
} from '@/services/planilla.service';
import {
  activarEstablecimiento,
  listarEstablecimientos,
  type Establecimiento,
} from '@/services/farms.service';

export interface Planilla {
  establecimientos: Establecimiento[];
  establecimientoId: string | null;
  cambiarEstablecimiento: (id: string) => Promise<void>;
  campanas: CampanaResumen[];
  campanaId: string | null;
  elegirCampana: (id: string) => Promise<void>;
  campana: CampanaCompleta | null;
  calculo: CalculoCampana | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  /** Vuelve a pedir la campaña elegida sin vaciar la pantalla; los errores van al que llama. */
  recargar: () => Promise<void>;
  crearCampanaDelAnio: () => Promise<void>;
}

function masReciente(lista: readonly CampanaResumen[]): CampanaResumen | null {
  return lista.reduce<CampanaResumen | null>((max, c) => (!max || c.anio > max.anio ? c : max), null);
}

function mensaje(err: unknown): string {
  return err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
}

export function usePlanilla(): Planilla {
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [establecimientoId, setEstablecimientoId] = useState<string | null>(null);
  const [campanas, setCampanas] = useState<CampanaResumen[]>([]);
  const [campanaId, setCampanaId] = useState<string | null>(null);
  const [campana, setCampana] = useState<CampanaCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  // Cada operación toma un número; las respuestas de una operación vieja se descartan,
  // así la campaña de un campo anterior no pisa la del campo elegido.
  const generacion = useRef(0);
  // Aparte: la lista de establecimientos no depende de las operaciones de campaña.
  // Sube cuando el servidor confirma un cambio de campo, para que una lista pedida
  // antes no vuelva a marcar el campo anterior.
  const generacionCampo = useRef(0);
  const campanaIdRef = useRef<string | null>(null);
  campanaIdRef.current = campanaId;

  const ejecutar = useCallback(async (trabajo: (g: number) => Promise<void>) => {
    const g = ++generacion.current;
    setLoading(true);
    setError(null);
    try {
      await trabajo(g);
    } catch (err) {
      if (g === generacion.current) setError(mensaje(err));
    } finally {
      if (g === generacion.current) setLoading(false);
    }
  }, []);

  const cargarCampana = useCallback(async (id: string, g: number) => {
    const c = await obtenerCampana(id);
    if (g === generacion.current) setCampana(c);
  }, []);

  const cargarCampanas = useCallback(
    async (g: number, preferida: string | null = null) => {
      const lista = await listarCampanas();
      if (g !== generacion.current) return;
      setCampanas(lista);
      const id = lista.some((c) => c.id === preferida) ? preferida : masReciente(lista)?.id ?? null;
      setCampanaId(id);
      if (id) await cargarCampana(id, g);
      else setCampana(null);
    },
    [cargarCampana],
  );

  const cargarEstablecimientos = useCallback(async () => {
    const g = generacionCampo.current;
    try {
      const lista = await listarEstablecimientos();
      setEstablecimientos(lista);
      // El campo elegido es el que el servidor tiene activo.
      if (g === generacionCampo.current) {
        setEstablecimientoId(lista.find((e) => e.activo)?.id ?? null);
      }
    } catch (err) {
      setError(mensaje(err));
    }
  }, []);

  useEffect(() => {
    void cargarEstablecimientos();
    void ejecutar((g) => cargarCampanas(g, campanaIdRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intento]);

  const cambiarEstablecimiento = useCallback(
    (id: string) =>
      ejecutar(async (g) => {
        setCampana(null);
        setCampanas([]);
        setCampanaId(null);
        await activarEstablecimiento(id);
        if (g !== generacion.current) return;
        // Recién con el campo activado en el servidor cambia la selección.
        generacionCampo.current++;
        setEstablecimientoId(id);
        await cargarCampanas(g);
      }),
    [ejecutar, cargarCampanas],
  );

  const elegirCampana = useCallback(
    (id: string) =>
      ejecutar(async (g) => {
        setCampanaId(id);
        setCampana(null);
        await cargarCampana(id, g);
      }),
    [ejecutar, cargarCampana],
  );

  const crearCampanaDelAnio = useCallback(
    () =>
      ejecutar(async (g) => {
        const nueva = await crearCampana(new Date().getFullYear());
        await cargarCampanas(g, nueva.id);
      }),
    [ejecutar, cargarCampanas],
  );

  const recargar = useCallback(async () => {
    const id = campanaIdRef.current;
    if (!id) return;
    await cargarCampana(id, generacion.current);
  }, [cargarCampana]);

  const retry = useCallback(() => setIntento((n) => n + 1), []);

  const calculo = useMemo(() => (campana ? calcularCampana(campana) : null), [campana]);

  return {
    establecimientos,
    establecimientoId,
    cambiarEstablecimiento,
    campanas,
    campanaId,
    elegirCampana,
    campana,
    calculo,
    loading,
    error,
    retry,
    recargar,
    crearCampanaDelAnio,
  };
}
