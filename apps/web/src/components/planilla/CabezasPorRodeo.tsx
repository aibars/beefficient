import type { ResultadosCampana, RodeoCampana } from '@beefficient/domain';
import { etiquetaMesCorto } from '@/lib/planilla/vista';
import { num } from './formato';

interface Props {
  resultados: ResultadosCampana;
  rodeos: readonly RodeoCampana[];
}

/** Intensidad del fondo (1 a 3) según el valor relativo al máximo; 0 = sin fondo. */
function intensidad(valor: number, maximo: number): string | undefined {
  if (valor <= 0 || maximo <= 0) return undefined;
  const r = valor / maximo;
  return r > 2 / 3 ? 'calor-3' : r > 1 / 3 ? 'calor-2' : 'calor-1';
}

export function CabezasPorRodeo({ resultados, rodeos }: Props) {
  const nombre = new Map(rodeos.map((r) => [r.id, r.nombre]));
  const maximo = Math.max(0, ...resultados.rodeos.flatMap((r) => r.cabezasPorMes));
  return (
    <section className="planilla-card">
      <h2 className="planilla-card-titulo">Cabezas por rodeo y mes</h2>
      <div className="planilla-scroll">
        <table className="planilla-tabla planilla-calor">
          <thead>
            <tr>
              <th className="izq">Rodeo</th>
              {resultados.meses.map((m) => (
                <th key={m}>{etiquetaMesCorto(m)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resultados.rodeos.map((r) => (
              <tr key={r.rodeoId ?? 'sin-rodeo'}>
                <td className="izq">{(r.rodeoId && nombre.get(r.rodeoId)) ?? '—'}</td>
                {r.cabezasPorMes.map((c, k) => (
                  <td key={resultados.meses[k] ?? k} className={intensidad(c, maximo)}>
                    {c > 0 ? num(c) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
