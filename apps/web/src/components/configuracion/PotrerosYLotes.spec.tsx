import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/api';
import {
  borrarLote,
  crearLote,
  listarLotes,
  listarPotreros,
} from '@/services/planilla.service';
import { PotrerosYLotes } from './PotrerosYLotes';

jest.mock('@/services/planilla.service', () => ({
  listarPotreros: jest.fn(),
  crearPotrero: jest.fn(),
  actualizarPotrero: jest.fn(),
  borrarPotrero: jest.fn(),
  listarLotes: jest.fn(),
  crearLote: jest.fn(),
  actualizarLote: jest.fn(),
  borrarLote: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (listarPotreros as jest.Mock).mockResolvedValue([
    { id: 'p1', nombre: 'Norte', hectareas: 35 },
  ]);
  (listarLotes as jest.Mock).mockResolvedValue([
    { id: 'l1', nombre: 'La Loma', hectareas: 30, potreroId: null },
  ]);
});

async function abrirLoteNuevo() {
  render(<PotrerosYLotes onCambio={jest.fn()} />);
  await screen.findByText('La Loma');
  fireEvent.click(screen.getByRole('button', { name: '+ Lote' }));
}

describe('PotrerosYLotes', () => {
  it('completa las hectáreas del potrero elegido si el campo estaba vacío', async () => {
    await abrirLoteNuevo();
    fireEvent.change(screen.getByLabelText('Potrero del lote'), { target: { value: 'p1' } });
    expect((screen.getByLabelText('Hectáreas del lote') as HTMLInputElement).value).toBe('35');
  });

  it('no pisa las hectáreas que escribió el usuario', async () => {
    await abrirLoteNuevo();
    fireEvent.change(screen.getByLabelText('Hectáreas del lote'), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText('Potrero del lote'), { target: { value: 'p1' } });
    expect((screen.getByLabelText('Hectáreas del lote') as HTMLInputElement).value).toBe('20');
  });

  it('envía el lote nuevo con solo los campos del DTO', async () => {
    (crearLote as jest.Mock).mockResolvedValue({});
    await abrirLoteNuevo();
    fireEvent.change(screen.getByLabelText('Nombre del lote'), { target: { value: 'Bajo' } });
    fireEvent.change(screen.getByLabelText('Potrero del lote'), { target: { value: 'p1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar lote' }));
    await waitFor(() =>
      expect(crearLote).toHaveBeenCalledWith({ nombre: 'Bajo', hectareas: 35, potreroId: 'p1' }),
    );
  });

  it('muestra el 409 al borrar un lote con pastoreos', async () => {
    (borrarLote as jest.Mock).mockRejectedValue(new ApiError(409, 'El lote tiene pastoreos cargados.'));
    render(<PotrerosYLotes onCambio={jest.fn()} />);
    await screen.findByText('La Loma');
    fireEvent.click(screen.getByRole('button', { name: 'Borrar La Loma' }));
    expect(await screen.findByText('El lote tiene pastoreos cargados.')).toBeTruthy();
  });
});
