import type { ResultadosCampana } from '@beefficient/domain';
import { etiquetaMesCorto, type Unidad } from '@/lib/planilla/vista';
import { num, unidadCarga } from './formato';

interface Props {
  resultados: ResultadosCampana;
  unidad: Unidad;
}

export function CargaPorMes({ resultados, unidad }: Props) {
  const maximo = Math.max(0, ...resultados.porMes.map((m) => m.carga ?? 0));
  return (
    <section className="planilla-card">
      <h2 className="planilla-card-titulo">Carga por mes</h2>
      <div className="planilla-barras">
        {resultados.porMes.map((m) => {
          const alto = m.carga !== null && maximo > 0 ? (m.carga / maximo) * 100 : 0;
          const valor = `${num(m.carga, 2)} ${unidadCarga(unidad)}`;
          return (
            <div key={m.mes} className="planilla-barra-col" title={valor}>
              <div
                className={m.carga === null ? 'planilla-barra vacia' : 'planilla-barra'}
                style={m.carga === null ? undefined : { height: `${alto}%` }}
                role="img"
                aria-label={`${etiquetaMesCorto(m.mes)}: ${valor}`}
              />
            </div>
          );
        })}
      </div>
      <div className="planilla-barras-meses" aria-hidden="true">
        {resultados.porMes.map((m) => (
          <span key={m.mes}>{etiquetaMesCorto(m.mes)}</span>
        ))}
      </div>
    </section>
  );
}
