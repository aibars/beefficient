import type { ResultadosCampana } from '@beefficient/domain';
import { NOMBRES_MES, type Unidad } from '@/lib/planilla/vista';
import { ha, num, unidadCarga } from './formato';

interface Props {
  resultados: ResultadosCampana;
  unidad: Unidad;
  cantidadLotes: number;
  mesServicio: number;
}

export function TotalesCampana({ resultados, unidad, cantidadLotes, mesServicio }: Props) {
  const tarjetas = [
    { etiqueta: 'Carga anual', valor: num(resultados.cargaAnual, 2), pie: unidadCarga(unidad) },
    { etiqueta: 'Raciones', valor: num(resultados.racionesTotales), pie: 'en la campaña' },
    {
      etiqueta: 'Superficie',
      valor: ha(resultados.superficieTotal),
      pie: `ha · ${cantidadLotes} ${cantidadLotes === 1 ? 'lote' : 'lotes'}`,
    },
    {
      etiqueta: 'Eficiencia de cosecha',
      valor: `${num(resultados.eficienciaCosecha)} %`,
      pie: `mes de servicio: ${NOMBRES_MES[mesServicio - 1] ?? '—'}`,
    },
  ];
  return (
    <section className="planilla-totales" aria-label="Totales">
      {tarjetas.map((t) => (
        <div key={t.etiqueta} className="planilla-card planilla-total">
          <span className="planilla-etiqueta">{t.etiqueta}</span>
          <strong className="planilla-total-valor">{t.valor}</strong>
          <span className="planilla-etiqueta">{t.pie}</span>
        </div>
      ))}
    </section>
  );
}
