import { act, renderHook, waitFor } from '@testing-library/react';
import * as planilla from '@/services/planilla.service';
import * as farms from '@/services/farms.service';
import type { CampanaCompleta, CampanaResumen } from '@/services/planilla.service';
import { usePlanilla } from './usePlanilla';

jest.mock('@/services/planilla.service');
jest.mock('@/services/farms.service');

const mPlanilla = planilla as jest.Mocked<typeof planilla>;
const mFarms = farms as jest.Mocked<typeof farms>;

const resumen = (id: string, anio: number): CampanaResumen => ({
  id,
  anio,
  mesServicio: 1,
  eficienciaCosecha: 50,
});

const completa = (id: string, anio: number): CampanaCompleta => ({
  id,
  anio,
  mesServicio: 1,
  eficienciaCosecha: 50,
  lotes: [{ id: 'l1', nombre: 'La Loma', hectareas: 30 }],
  rodeos: [
    {
      id: 'r1',
      nombre: 'Vacas',
      categoria: 'Vaca',
      pesoVivo: 400,
      ganancia: Array(12).fill(null),
      inicioServicio: null,
      duracionServicio: 90,
      destete: null,
      usaCocimano: false,
    },
  ],
  pastoreos: [
    { id: 'p1', loteId: 'l1', rodeoId: 'r1', cabezas: 100, entrada: `${anio}-03-01`, salida: `${anio}-04-01`, categoriaTabla1Id: null, evManual: 1 },
    { id: 'p2', loteId: 'l1', rodeoId: null, cabezas: null, entrada: null, salida: null, categoriaTabla1Id: null, evManual: null },
  ],
});

function diferido<T>() {
  let resolver!: (v: T) => void;
  const promesa = new Promise<T>((r) => {
    resolver = r;
  });
  return { promesa, resolver };
}

beforeEach(() => {
  jest.resetAllMocks();
  mFarms.listarEstablecimientos.mockResolvedValue([
    { id: 'A', nombre: 'La Esperanza', activo: true },
    { id: 'B', nombre: 'El Ombú', activo: false },
  ]);
});

describe('usePlanilla', () => {
  it('elige la campaña de año más alto y expone el cálculo con una fila por pastoreo', async () => {
    mPlanilla.listarCampanas.mockResolvedValue([resumen('c24', 2024), resumen('c26', 2026), resumen('c25', 2025)]);
    mPlanilla.obtenerCampana.mockImplementation(async (id) => completa(id, 2026));

    const { result } = renderHook(() => usePlanilla());

    await waitFor(() => expect(result.current.campana?.id).toBe('c26'));
    expect(result.current.campanaId).toBe('c26');
    expect(result.current.establecimientoId).toBe('A');
    expect(result.current.establecimientos).toHaveLength(2);
    expect(result.current.calculo?.filas).toHaveLength(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('cambiarEstablecimiento activa el campo, vacía la campaña mientras carga y muestra las campañas del nuevo', async () => {
    mPlanilla.listarCampanas
      .mockResolvedValueOnce([resumen('a26', 2026)])
      .mockResolvedValueOnce([resumen('b25', 2025), resumen('b27', 2027)]);
    mPlanilla.obtenerCampana.mockImplementation(async (id) => completa(id, id === 'a26' ? 2026 : 2027));
    const activacion = diferido<void>();
    mFarms.activarEstablecimiento.mockReturnValue(activacion.promesa);

    const { result } = renderHook(() => usePlanilla());
    await waitFor(() => expect(result.current.campana?.id).toBe('a26'));

    let cambio!: Promise<void>;
    act(() => {
      cambio = result.current.cambiarEstablecimiento('B');
    });

    expect(mFarms.activarEstablecimiento).toHaveBeenCalledWith('B');
    expect(result.current.campana).toBeNull();
    expect(result.current.calculo).toBeNull();
    expect(result.current.campanas).toEqual([]);
    // La selección cambia recién cuando el servidor activó el campo.
    expect(result.current.establecimientoId).toBe('A');
    expect(result.current.loading).toBe(true);

    await act(async () => {
      activacion.resolver();
      await cambio;
    });

    expect(result.current.establecimientoId).toBe('B');
    expect(result.current.campanas.map((c) => c.id)).toEqual(['b25', 'b27']);
    expect(result.current.campanaId).toBe('b27');
    expect(result.current.campana?.id).toBe('b27');
    expect(result.current.loading).toBe(false);
  });

  it('si la campaña del campo anterior llega tarde, no pisa la del nuevo', async () => {
    mPlanilla.listarCampanas
      .mockResolvedValueOnce([resumen('a26', 2026)])
      .mockResolvedValueOnce([resumen('b26', 2026)]);
    const tardia = diferido<CampanaCompleta>();
    mPlanilla.obtenerCampana.mockImplementation((id) =>
      id === 'a26' ? tardia.promesa : Promise.resolve(completa(id, 2026)),
    );
    mFarms.activarEstablecimiento.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePlanilla());
    await waitFor(() => expect(mPlanilla.obtenerCampana).toHaveBeenCalledWith('a26'));

    await act(async () => {
      await result.current.cambiarEstablecimiento('B');
    });
    expect(result.current.campana?.id).toBe('b26');

    await act(async () => {
      tardia.resolver(completa('a26', 2026));
      await tardia.promesa;
    });
    expect(result.current.campana?.id).toBe('b26');
    expect(result.current.campanaId).toBe('b26');
  });

  it('si la activación falla, el campo sigue siendo A y el reintento muestra las campañas de A', async () => {
    mPlanilla.listarCampanas.mockResolvedValue([resumen('a26', 2026)]);
    mPlanilla.obtenerCampana.mockImplementation(async (id) => completa(id, 2026));
    mFarms.activarEstablecimiento.mockRejectedValue(new Error('No sos miembro de ese establecimiento.'));

    const { result } = renderHook(() => usePlanilla());
    await waitFor(() => expect(result.current.campana?.id).toBe('a26'));

    await act(async () => {
      await result.current.cambiarEstablecimiento('B');
    });

    expect(mFarms.activarEstablecimiento).toHaveBeenCalledWith('B');
    expect(result.current.establecimientoId).toBe('A');
    expect(result.current.error).toBe('No sos miembro de ese establecimiento.');
    expect(result.current.loading).toBe(false);

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.campana?.id).toBe('a26'));
    expect(result.current.establecimientoId).toBe('A');
    expect(result.current.campanas.map((c) => c.id)).toEqual(['a26']);
    expect(result.current.error).toBeNull();
  });

  it('elegir una campaña mientras carga la inicial no pierde la lista de establecimientos', async () => {
    mPlanilla.listarCampanas.mockResolvedValue([resumen('c25', 2025), resumen('c26', 2026)]);
    const inicial = diferido<CampanaCompleta>();
    mPlanilla.obtenerCampana.mockImplementation((id) =>
      id === 'c26' ? inicial.promesa : Promise.resolve(completa(id, 2025)),
    );

    const { result } = renderHook(() => usePlanilla());
    await waitFor(() => expect(mPlanilla.obtenerCampana).toHaveBeenCalledWith('c26'));

    await act(async () => {
      await result.current.elegirCampana('c25');
    });
    await act(async () => {
      inicial.resolver(completa('c26', 2026));
      await inicial.promesa;
    });

    expect(result.current.campana?.id).toBe('c25');
    expect(result.current.establecimientos.map((e) => e.id)).toEqual(['A', 'B']);
    expect(result.current.establecimientoId).toBe('A');
  });

  it('si falla la carga de la campaña, la lista de establecimientos queda disponible', async () => {
    mPlanilla.listarCampanas.mockResolvedValue([resumen('c26', 2026)]);
    mPlanilla.obtenerCampana.mockRejectedValue(new Error('No se pudo cargar la campaña.'));

    const { result } = renderHook(() => usePlanilla());

    await waitFor(() => expect(result.current.error).toBe('No se pudo cargar la campaña.'));
    await waitFor(() => expect(result.current.establecimientos).toHaveLength(2));
    expect(result.current.establecimientoId).toBe('A');
  });

  it('crearCampanaDelAnio crea la del año actual y la elige', async () => {
    const anio = new Date().getFullYear();
    mPlanilla.listarCampanas
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([resumen('nueva', anio)]);
    mPlanilla.crearCampana.mockResolvedValue(resumen('nueva', anio));
    mPlanilla.obtenerCampana.mockImplementation(async (id) => completa(id, anio));

    const { result } = renderHook(() => usePlanilla());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.campanas).toEqual([]);
    expect(result.current.campana).toBeNull();

    await act(async () => {
      await result.current.crearCampanaDelAnio();
    });

    expect(mPlanilla.crearCampana).toHaveBeenCalledWith(anio);
    expect(result.current.campanaId).toBe('nueva');
    expect(result.current.campana?.id).toBe('nueva');
  });

  it('expone el error de la API', async () => {
    mPlanilla.listarCampanas.mockRejectedValue(new Error('No tenés un establecimiento activo.'));

    const { result } = renderHook(() => usePlanilla());

    await waitFor(() => expect(result.current.error).toBe('No tenés un establecimiento activo.'));
    expect(result.current.loading).toBe(false);
  });

  it('recargar que falla deja el mensaje en error, sin rechazar y conservando la campaña', async () => {
    mPlanilla.listarCampanas.mockResolvedValue([resumen('c26', 2026)]);
    mPlanilla.obtenerCampana.mockResolvedValueOnce(completa('c26', 2026));
    const { result } = renderHook(() => usePlanilla());
    await waitFor(() => expect(result.current.campana?.id).toBe('c26'));

    mPlanilla.obtenerCampana.mockRejectedValueOnce(new Error('No se pudo conectar'));
    await act(async () => {
      await result.current.recargar();
    });

    expect(result.current.error).toBe('No se pudo conectar');
    expect(result.current.campana?.id).toBe('c26');
  });
});
