import { render, screen } from '@testing-library/react';
import { usePlanilla } from '@/hooks/usePlanilla';
import PlanillaPage from './page';

jest.mock('@/hooks/usePlanilla');

const base = {
  establecimientos: [],
  establecimientoId: null,
  cambiarEstablecimiento: jest.fn(),
  campanas: [],
  campanaId: null,
  elegirCampana: jest.fn(),
  campana: null,
  calculo: null,
  loading: false,
  error: null,
  retry: jest.fn(),
  recargar: jest.fn(),
  crearCampanaDelAnio: jest.fn(),
};

describe('PlanillaPage', () => {
  it('muestra el error del hook con Reintentar en lugar de romper', () => {
    (usePlanilla as jest.Mock).mockReturnValue({
      ...base,
      campanas: [{ id: 'c1', anio: 2026, mesServicio: 11, eficienciaCosecha: 50 }],
      campanaId: 'c1',
      campana: { id: 'c1', anio: 2026, mesServicio: 11, eficienciaCosecha: 50, lotes: [], rodeos: [], pastoreos: [] },
      error: 'No se pudo calcular la campaña.',
    });
    render(<PlanillaPage />);
    expect(screen.getByRole('alert').textContent).toContain('No se pudo calcular la campaña.');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });

  it('con error del motor deshabilita + Pastoreo', () => {
    (usePlanilla as jest.Mock).mockReturnValue({
      ...base,
      campanaId: 'c1',
      campana: { id: 'c1', anio: 2026, mesServicio: 11, eficienciaCosecha: 50, lotes: [], rodeos: [], pastoreos: [] },
      calculo: null,
      error: 'No se pudo calcular la campaña.',
    });
    render(<PlanillaPage />);
    expect((screen.getByRole('button', { name: '+ Pastoreo' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
