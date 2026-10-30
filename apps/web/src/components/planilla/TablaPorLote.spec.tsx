import { render, screen } from '@testing-library/react';
import { calcularCampana } from '@beefficient/domain';
import type { CampanaCompleta } from '@/services/planilla.service';
import { TablaPorLote } from './TablaPorLote';

const campana: CampanaCompleta = {
  id: 'c1',
  anio: 2026,
  mesServicio: 11,
  eficienciaCosecha: 50,
  lotes: [{ id: 'l1', nombre: 'La Loma', hectareas: 30 }],
  rodeos: [
    { id: 'r1', nombre: 'Vacas', categoria: 'Vaca', pesoVivo: 420, ganancia: Array(12).fill(null), inicioServicio: null, duracionServicio: 90, destete: null, usaCocimano: false },
  ],
  pastoreos: [
    { id: 'p1', loteId: 'l1', rodeoId: 'r1', cabezas: 100, entrada: '2026-03-01', salida: '2026-04-01', categoriaTabla1Id: null, evManual: 1 },
  ],
};

describe('TablaPorLote', () => {
  it('titula la columna de ocupación «Ocupación»', () => {
    const calculo = calcularCampana(campana);
    render(<TablaPorLote resultados={calculo.ev} lotes={campana.lotes} />);
    expect(screen.getByRole('columnheader', { name: 'Ocupación' })).toBeTruthy();
    expect(screen.queryByRole('columnheader', { name: 'Ocup.' })).toBeNull();
  });
});
