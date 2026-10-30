import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { crearRodeo } from '@/services/planilla.service';
import { FormRodeo } from './FormRodeo';

jest.mock('@/services/planilla.service', () => ({
  crearRodeo: jest.fn(),
  actualizarRodeo: jest.fn(),
}));

describe('FormRodeo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('arma ganancia con 12 valores (null en los vacíos) y envía duracionServicio como número', async () => {
    (crearRodeo as jest.Mock).mockResolvedValue({});
    const onGuardado = jest.fn();
    render(<FormRodeo campanaId="c1" rodeo={null} onGuardado={onGuardado} onCancelar={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Vacas 1' } });
    fireEvent.change(screen.getByLabelText('Ganancia enero'), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText('Ganancia marzo'), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText('Duración del servicio'), { target: { value: '105' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(crearRodeo).toHaveBeenCalled());
    const [campanaId, body] = (crearRodeo as jest.Mock).mock.calls[0];
    expect(campanaId).toBe('c1');
    expect(body.nombre).toBe('Vacas 1');
    expect(body.duracionServicio).toBe(105);
    expect(body.ganancia).toEqual([300, null, 150, null, null, null, null, null, null, null, null, null]);
    expect(body.ganancia).toHaveLength(12);
    expect(body).not.toHaveProperty('id');
    await waitFor(() => expect(onGuardado).toHaveBeenCalled());
  });

  it('deshabilita Guardar con peso vivo fuera de rango', () => {
    render(<FormRodeo campanaId="c1" rodeo={null} onGuardado={jest.fn()} onCancelar={jest.fn()} />);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Vacas 1' } });
    const guardar = () => screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement;
    expect(guardar().disabled).toBe(false);
    fireEvent.change(screen.getByLabelText('Peso vivo (kg)'), { target: { value: '100000' } });
    expect(guardar().disabled).toBe(true);
  });

  it('deshabilita Guardar con peso vivo ilegible (badInput) o con 3 decimales', () => {
    render(<FormRodeo campanaId="c1" rodeo={null} onGuardado={jest.fn()} onCancelar={jest.fn()} />);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Vacas 1' } });
    const guardar = () => screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement;
    const peso = screen.getByLabelText('Peso vivo (kg)');
    fireEvent.change(peso, { target: { value: '420.123' } });
    expect(guardar().disabled).toBe(true);
    fireEvent.change(peso, { target: { value: '420.12' } });
    expect(guardar().disabled).toBe(false);
    Object.defineProperty(peso, 'validity', { value: { badInput: true }, configurable: true });
    fireEvent.change(peso, { target: { value: '' } });
    expect(guardar().disabled).toBe(true);
  });
});
