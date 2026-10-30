import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/api';
import {
  borrarLote,
  borrarPotrero,
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
    { id: 'p2', nombre: 'Sur', hectareas: 20 },
  ]);
  (listarLotes as jest.Mock).mockResolvedValue([
    { id: 'l1', nombre: 'La Loma', hectareas: 30, potreroId: null },
    { id: 'l2', nombre: 'El Bajo', hectareas: 35, potreroId: 'p1' },
    { id: 'l3', nombre: 'La Cuchilla', hectareas: 12, potreroId: 'p1' },
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
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar borrar La Loma' }));
    expect(await screen.findByText('El lote tiene pastoreos cargados.')).toBeTruthy();
  });

  it('borra un lote o un potrero solo al confirmar', async () => {
    (borrarLote as jest.Mock).mockResolvedValue(undefined);
    (borrarPotrero as jest.Mock).mockResolvedValue(undefined);
    render(<PotrerosYLotes onCambio={jest.fn()} />);
    await screen.findByText('La Loma');
    fireEvent.click(screen.getByRole('button', { name: 'Borrar La Loma' }));
    fireEvent.click(screen.getByRole('button', { name: 'Borrar potrero Norte' }));
    expect(borrarLote).not.toHaveBeenCalled();
    expect(borrarPotrero).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar borrar La Loma' }));
    await waitFor(() => expect(borrarLote).toHaveBeenCalledWith('l1'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar borrar potrero Norte' }));
    await waitFor(() => expect(borrarPotrero).toHaveBeenCalledWith('p1'));
  });

  it('deshabilita Guardar con hectáreas fuera de rango', async () => {
    await abrirLoteNuevo();
    fireEvent.change(screen.getByLabelText('Nombre del lote'), { target: { value: 'Bajo' } });
    const guardar = () => screen.getByRole('button', { name: 'Guardar lote' }) as HTMLButtonElement;
    expect(guardar().disabled).toBe(false);
    fireEvent.change(screen.getByLabelText('Hectáreas del lote'), { target: { value: '0' } });
    expect(guardar().disabled).toBe(true);
  });

  it('deshabilita Guardar del potrero con hectáreas fuera de rango', async () => {
    render(<PotrerosYLotes onCambio={jest.fn()} />);
    await screen.findByText('La Loma');
    fireEvent.click(screen.getByRole('button', { name: '+ Potrero' }));
    fireEvent.change(screen.getByLabelText('Nombre del potrero'), { target: { value: 'Este' } });
    fireEvent.change(screen.getByLabelText('Hectáreas del potrero'), { target: { value: '10' } });
    const guardar = () => screen.getByRole('button', { name: 'Guardar potrero' }) as HTMLButtonElement;
    expect(guardar().disabled).toBe(false);
    fireEvent.change(screen.getByLabelText('Hectáreas del potrero'), { target: { value: '100000000' } });
    expect(guardar().disabled).toBe(true);
  });

  it('los botones Editar llevan el nombre de la fila', async () => {
    render(<PotrerosYLotes onCambio={jest.fn()} />);
    await screen.findByText('La Loma');
    expect(screen.getByRole('button', { name: 'Editar La Loma' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Editar potrero Norte' })).toBeTruthy();
  });

  it('deshabilita Guardar del lote con hectáreas ilegibles (badInput)', async () => {
    await abrirLoteNuevo();
    fireEvent.change(screen.getByLabelText('Nombre del lote'), { target: { value: 'Bajo' } });
    const input = screen.getByLabelText('Hectáreas del lote');
    Object.defineProperty(input, 'validity', { value: { badInput: true }, configurable: true });
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.change(input, { target: { value: '' } });
    expect((screen.getByRole('button', { name: 'Guardar lote' }) as HTMLButtonElement).disabled).toBe(true);
  });

  const ha = () => (screen.getByLabelText('Hectáreas del lote') as HTMLInputElement).value;
  const potrero = (id: string) =>
    fireEvent.change(screen.getByLabelText('Potrero del lote'), { target: { value: id } });

  it('reemplaza las hectáreas autocompletadas al cambiar de potrero', async () => {
    await abrirLoteNuevo();
    potrero('p1');
    expect(ha()).toBe('35');
    potrero('p2');
    expect(ha()).toBe('20');
  });

  it('al editar un lote con las hectáreas de su potrero, siguen al nuevo potrero', async () => {
    render(<PotrerosYLotes onCambio={jest.fn()} />);
    await screen.findByText('El Bajo');
    fireEvent.click(screen.getByRole('button', { name: 'Editar El Bajo' }));
    expect(ha()).toBe('35');
    potrero('p2');
    expect(ha()).toBe('20');
  });

  it('al editar un lote con hectáreas propias, no las pisa al cambiar de potrero', async () => {
    render(<PotrerosYLotes onCambio={jest.fn()} />);
    await screen.findByText('La Cuchilla');
    fireEvent.click(screen.getByRole('button', { name: 'Editar La Cuchilla' }));
    expect(ha()).toBe('12');
    potrero('p2');
    expect(ha()).toBe('12');
  });
});
