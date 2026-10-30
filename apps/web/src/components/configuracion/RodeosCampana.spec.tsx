import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { CampanaCompleta } from '@/services/planilla.service';
import { borrarRodeo } from '@/services/planilla.service';
import { RodeosCampana } from './RodeosCampana';

jest.mock('@/services/planilla.service', () => ({
  borrarRodeo: jest.fn(),
  crearRodeo: jest.fn(),
  actualizarRodeo: jest.fn(),
}));

const campana: CampanaCompleta = {
  id: 'c1',
  anio: 2026,
  mesServicio: 11,
  eficienciaCosecha: 50,
  lotes: [],
  rodeos: [
    {
      id: 'r1',
      nombre: 'Vacas',
      categoria: null,
      pesoVivo: 420,
      ganancia: Array(12).fill(null),
      inicioServicio: null,
      duracionServicio: 90,
      destete: null,
      usaCocimano: true,
    },
  ],
  pastoreos: [],
};

describe('RodeosCampana', () => {
  it('borra un rodeo solo al confirmar', async () => {
    (borrarRodeo as jest.Mock).mockResolvedValue(undefined);
    const onCambio = jest.fn();
    render(<RodeosCampana campana={campana} onCambio={onCambio} />);
    fireEvent.click(screen.getByRole('button', { name: 'Borrar Vacas' }));
    expect(borrarRodeo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar borrar Vacas' }));
    await waitFor(() => expect(borrarRodeo).toHaveBeenCalledWith('c1', 'r1'));
    expect(onCambio).toHaveBeenCalled();
  });
});
