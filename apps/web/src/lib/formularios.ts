/** Helpers de los formularios: pasan entre el texto de un input y el valor que viaja a la API. */

export const aTexto = (n: number | null | undefined): string =>
  n === null || n === undefined ? '' : String(n);

export const aNumero = (t: string): number | null => (t.trim() === '' ? null : Number(t));

export function mensajeDe(err: unknown): string {
  return err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
}
