import { fireEvent, render, screen } from '@testing-library/react';
import type { CampanaCompleta } from '@/services/planilla.service';
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
});
