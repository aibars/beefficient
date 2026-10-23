import { QueryFailedError } from 'typeorm';

/** PostgreSQL `unique_violation` (also raised for primary-key collisions). */
export const PG_UNIQUE_VIOLATION = '23505';

export const isUniqueViolation = (err: unknown): boolean =>
  err instanceof QueryFailedError &&
  (err.driverError as { code?: string } | undefined)?.code ===
    PG_UNIQUE_VIOLATION;
