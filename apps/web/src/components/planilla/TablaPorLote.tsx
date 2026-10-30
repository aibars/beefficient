import type { LoteCampana, ResultadosCampana } from '@beefficient/domain';
import { ha, num, porcentaje } from './formato';

interface Props {
  resultados: ResultadosCampana;
  lotes: readonly LoteCampana[];
}

export function TablaPorLote({ resultados, lotes }: Props) {
  const nombre = new Map(lotes.map((l) => [l.id, l.nombre]));
  return (
    <section className="planilla-card">
      <h2 className="planilla-card-titulo">Por lote</h2>
      <div className="planilla-scroll">
        <table className="planilla-tabla">
          <thead>
            <tr>
              <th className="izq">Lote</th>
              <th>ha</th>
              <th>Días</th>
              <th>Ocup.</th>
              <th>Carga</th>
              <th>Rac/ha</th>
            </tr>
          </thead>
          <tbody>
            {resultados.lotes.map((l) => (
              <tr key={l.loteId}>
                <td className="izq">{nombre.get(l.loteId) ?? '—'}</td>
                <td>{ha(l.hectareas)}</td>
                <td>{num(l.dias)}</td>
                <td>{porcentaje(l.ocupacion)}</td>
                <td className="calc">{num(l.carga, 2)}</td>
                <td className="calc">{num(l.racionesPorHa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
