import { useCallback, useState, type ChangeEvent } from 'react';

/**
 * Límites de los campos numéricos, iguales a los de los DTOs de la API, para que un error
 * obvio no viaje al servidor. No es cálculo: solo dice si el texto del input está en rango.
 */
export interface Rango {
  min: number;
  max: number;
  step: number;
}

export const RANGOS = {
  cabezas: { min: 1, max: 2147483647, step: 1 },
  evManual: { min: 0.001, max: 999.999, step: 0.001 },
  hectareas: { min: 0.01, max: 99999999.99, step: 0.01 },
  eficiencia: { min: 1, max: 100, step: 0.01 },
  pesoVivo: { min: 0.01, max: 99999.99, step: 0.01 },
} as const satisfies Record<string, Rango>;

const decimalesDe = (n: number): number => (String(n).split('.')[1] ?? '').length;

/**
 * Vacío cuenta como válido (los campos opcionales se mandan como null). Con `step`, el valor no
 * puede tener más decimales que él (la API rechaza lo demás).
 */
export function enRango(texto: string, { min, max, step }: Rango): boolean {
  if (texto.trim() === '') return true;
  const n = Number(texto);
  if (!Number.isFinite(n) || n < min || n > max) return false;
  return decimalesDe(n) <= decimalesDe(step);
}

/**
 * Estado de un `<input type="number">` con límites. El navegador reporta `value === ''` cuando el
 * texto no se puede leer (`validity.badInput`): eso cuenta como inválido, no como vacío.
 */
export function useCampoNumerico(inicial: string, rango: Rango) {
  const [texto, setTextoCrudo] = useState(inicial);
  const [ilegible, setIlegible] = useState(false);
  const ok = !ilegible && enRango(texto, rango);

  const setTexto = useCallback((t: string) => {
    setTextoCrudo(t);
    setIlegible(false);
  }, []);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextoCrudo(e.target.value);
    setIlegible(e.target.validity.badInput);
  };

  return {
    texto,
    setTexto,
    ok,
    props: { type: 'number' as const, ...rango, value: texto, onChange, 'aria-invalid': !ok },
  };
}
