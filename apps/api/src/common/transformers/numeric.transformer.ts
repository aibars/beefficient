import { ValueTransformer } from 'typeorm';

/**
 * The pg driver returns `numeric` columns as strings to avoid precision loss.
 * The values stored here (prices, KPIs, metrics) fit comfortably in a JS number,
 * so they are exposed as numbers to match the web app's types.
 */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : Number(value),
};
