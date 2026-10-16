import type { ReactNode } from 'react';

/** Tabla para datos generados en los MDX (las tablas Markdown no aceptan filas calculadas). */
export function Tabla({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
