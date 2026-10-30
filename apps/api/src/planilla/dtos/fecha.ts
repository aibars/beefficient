import { isDateString, ValidateBy } from 'class-validator';

/** Solo aaaa-mm-dd: Postgres truncaría en silencio un datetime. */
export const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Fecha aaaa-mm-dd que existe en el calendario. Un solo validador para que una fecha mal
 * escrita dé un solo mensaje (con @IsDateString + @Matches salían dos).
 */
export function SoloFecha(message: string): PropertyDecorator {
  return ValidateBy({
    name: 'soloFecha',
    validator: {
      validate: (v: unknown) =>
        typeof v === 'string' && SOLO_FECHA.test(v) && isDateString(v, { strict: true }),
      defaultMessage: () => message,
    },
  });
}
