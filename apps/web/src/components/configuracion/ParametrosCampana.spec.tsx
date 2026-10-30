import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { actualizarCampana, type CampanaCompleta } from '@/services/planilla.service';
import { ParametrosCampana } from './ParametrosCampana';

jest.mock('@/services/planilla.service', () => ({ actualizarCampana: jest.fn() }));

const campana: CampanaCompleta = {
  id: 'c1',
  anio: 2026,
  mesServicio: 11,
  eficienciaCosecha: 50,
  lotes: [],
  rodeos: [],
  pastoreos: [],
};

describe('ParametrosCampana', () => {
  it.each(['0', '101'])('deshabilita Guardar con eficiencia %s', (valor) => {
    render(<ParametrosCampana campana={campana} onCambio={jest.fn()} />);
    const guardar = () => screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement;
    expect(guardar().disabled).toBe(false);
    fireEvent.change(screen.getByLabelText('Eficiencia de cosecha (%)'), { target: { value: valor } });
    expect(guardar().disabled).toBe(true);
    expect(screen.getByLabelText('Eficiencia de cosecha (%)').getAttribute('aria-invalid')).toBe('true');
  });

  it('deshabilita Guardar con más de 2 decimales de eficiencia', () => {
    render(<ParametrosCampana campana={campana} onCambio={jest.fn()} />);
    fireEvent.change(screen.getByLabelText('Eficiencia de cosecha (%)'), { target: { value: '50.255' } });
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Eficiencia de cosecha (%)'), { target: { value: '50.25' } });
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('deshabilita Guardar si la eficiencia tiene texto no parseable (badInput)', () => {
    render(<ParametrosCampana campana={campana} onCambio={jest.fn()} />);
    const input = screen.getByLabelText('Eficiencia de cosecha (%)');
    Object.defineProperty(input, 'validity', { value: { badInput: true }, configurable: true });
    fireEvent.change(input, { target: { value: '' } });
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('envía el mes de servicio y la eficiencia como números', async () => {
    (actualizarCampana as jest.Mock).mockResolvedValue({});
    const onCambio = jest.fn();
    render(<ParametrosCampana campana={campana} onCambio={onCambio} />);
    fireEvent.change(screen.getByLabelText('Mes de servicio'), { target: { value: '9' } });
    fireEvent.change(screen.getByLabelText('Eficiencia de cosecha (%)'), { target: { value: '62.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(onCambio).toHaveBeenCalled());
    expect(actualizarCampana).toHaveBeenCalledWith('c1', { mesServicio: 9, eficienciaCosecha: 62.5 });
  });
});
