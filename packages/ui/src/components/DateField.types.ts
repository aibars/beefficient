export interface DateFieldProps {
  label: string;
  /** Fecha ISO `aaaa-mm-dd`, o vacío. */
  value: string;
  onChange?: (value: string) => void;
  /** Marca el campo como parte de un error (p. ej., salida antes que entrada). */
  invalid?: boolean;
  disabled?: boolean;
}

export const aISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const desdeISO = (s: string): Date => {
  const [a, m, d] = s.split('-').map(Number);
  return new Date(a!, m! - 1, d!);
};
