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

/** Vacío cuenta como válido (los campos opcionales se mandan como null). */
export function enRango(texto: string, { min, max, step }: Rango): boolean {
  if (texto.trim() === '') return true;
  const n = Number(texto);
  if (!Number.isFinite(n) || n < min || n > max) return false;
  return step !== 1 || Number.isInteger(n);
}
