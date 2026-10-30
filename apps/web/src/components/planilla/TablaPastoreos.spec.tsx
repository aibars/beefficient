import { fireEvent, render, screen, within } from '@testing-library/react';
import { calcularCampana, formatearNumero, type PastoreoCampana } from '@beefficient/domain';
import type { CampanaCompleta } from '@/services/planilla.service';
import { TEXTO_AVISO } from '@/lib/planilla/vista';
import { TablaPastoreos } from './TablaPastoreos';

const past = (p: Partial<PastoreoCampana> & { id: string }): PastoreoCampana => ({
  loteId: 'l1',
  rodeoId: 'r1',
  cabezas: 100,
  entrada: '2026-03-01',
  salida: '2026-04-01',
  categoriaTabla1Id: 'vacas-cria',
  evManual: null,
  ...p,
});

const campana: CampanaCompleta = {
  id: 'c1',
  anio: 2026,
  mesServicio: 11,
  eficienciaCosecha: 50,
  lotes: [
    { id: 'l1', nombre: 'La Loma', hectareas: 30 },
    { id: 'l2', nombre: 'El Molino', hectareas: 35 },
  ],
  rodeos: [
    { id: 'r1', nombre: 'Vacas de cría', categoria: 'Vaca', pesoVivo: 420, ganancia: Array(12).fill(null), inicioServicio: null, duracionServicio: 90, destete: null, usaCocimano: false },
    { id: 'r2', nombre: 'Novillitos', categoria: 'Novillito', pesoVivo: 260, ganancia: Array(12).fill(null), inicioServicio: null, duracionServicio: 90, destete: null, usaCocimano: false },
  ],
  pastoreos: [
    past({ id: 'p1', loteId: 'l1', rodeoId: 'r1', cabezas: 180 }),
    past({ id: 'p2', loteId: 'l2', rodeoId: 'r2', cabezas: 120, entrada: '2026-05-05', salida: '2026-05-30' }),
    past({ id: 'p3', loteId: 'l1', rodeoId: 'r2', cabezas: 8, entrada: '2026-06-01', salida: '2026-06-01' }),
  ],
};
const calculo = calcularCampana(campana);

const filasDelCuerpo = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row');

describe('TablaPastoreos', () => {
  it('muestra una fila por pastoreo', () => {
    render(<TablaPastoreos campana={campana} calculo={calculo} unidad="EV" onAbrir={() => {}} />);
    expect(filasDelCuerpo()).toHaveLength(3);
  });

  it('con filtro de lote muestra solo las filas de ese lote', () => {
    render(<TablaPastoreos campana={campana} calculo={calculo} unidad="EV" onAbrir={() => {}} />);

    fireEvent.change(screen.getByLabelText('Lote'), { target: { value: 'l2' } });

    const filas = filasDelCuerpo();
    expect(filas).toHaveLength(1);
    expect(within(filas[0]!).getByText('El Molino')).toBeTruthy();
    expect(within(filas[0]!).getByText('Novillitos')).toBeTruthy();
  });

  it('con filtro de rodeo muestra solo las filas de ese rodeo', () => {
    render(<TablaPastoreos campana={campana} calculo={calculo} unidad="EV" onAbrir={() => {}} />);

    fireEvent.change(screen.getByLabelText('Rodeo'), { target: { value: 'r2' } });

    expect(filasDelCuerpo()).toHaveLength(2);
  });

  it('en kg MS muestra las raciones de fila.ms', () => {
    const fila = calculo.filas[0]!;
    expect(fila.ms.raciones).not.toBe(fila.ev.raciones);

    render(<TablaPastoreos campana={campana} calculo={calculo} unidad="MS" onAbrir={() => {}} />);

    const primera = filasDelCuerpo()[0]!;
    expect(within(primera).getByText(formatearNumero(fila.ms.raciones!))).toBeTruthy();
    expect(within(primera).queryByText(formatearNumero(fila.ev.raciones!))).toBeNull();
  });

  it('en EV muestra las raciones de fila.ev', () => {
    const fila = calculo.filas[0]!;
    render(<TablaPastoreos campana={campana} calculo={calculo} unidad="EV" onAbrir={() => {}} />);

    expect(within(filasDelCuerpo()[0]!).getByText(formatearNumero(fila.ev.raciones!))).toBeTruthy();
  });

  it('marca los avisos con el texto en title', () => {
    render(<TablaPastoreos campana={campana} calculo={calculo} unidad="EV" onAbrir={() => {}} />);

    const marca = within(filasDelCuerpo()[2]!).getByTitle(TEXTO_AVISO.fechas);
    expect(marca.textContent).toBe('!');
  });

  it('al hacer clic en una fila la abre', () => {
    const onAbrir = jest.fn();
    render(<TablaPastoreos campana={campana} calculo={calculo} unidad="EV" onAbrir={onAbrir} />);

    fireEvent.click(filasDelCuerpo()[1]!);

    expect(onAbrir).toHaveBeenCalledWith('p2');
  });
});
