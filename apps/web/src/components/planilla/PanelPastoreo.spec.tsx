import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type PastoreoCampana } from '@beefficient/domain';
import type { CampanaCompleta } from '@/services/planilla.service';
import { ApiError } from '@/lib/api';
import { calcularBorrador } from '@/lib/planilla/vista';
import { crearPastoreo, actualizarPastoreo, borrarPastoreo } from '@/services/planilla.service';
import { num } from './formato';
import { PanelPastoreo } from './PanelPastoreo';

jest.mock('@/services/planilla.service', () => ({
  crearPastoreo: jest.fn(),
  actualizarPastoreo: jest.fn(),
  borrarPastoreo: jest.fn(),
}));

const rodeo = (id: string, nombre: string, usaCocimano: boolean) => ({
  id,
  nombre,
  categoria: null,
  pesoVivo: 420,
  ganancia: Array(12).fill(null),
  inicioServicio: null,
  duracionServicio: 90 as const,
  destete: null,
  usaCocimano,
});

const existente: PastoreoCampana = {
  id: 'p1',
  loteId: 'l1',
  rodeoId: 'r1',
  cabezas: 65,
  entrada: '2026-04-02',
  salida: '2026-04-28',
  categoriaTabla1Id: 'vacas-cria',
  evManual: null,
};

const campana: CampanaCompleta = {
  id: 'c1',
  anio: 2026,
  mesServicio: 11,
  eficienciaCosecha: 50,
  lotes: [{ id: 'l1', nombre: 'La Loma', hectareas: 30 }],
  rodeos: [rodeo('r1', 'Con Cocimano', true), rodeo('r2', 'Sin Cocimano', false)],
  pastoreos: [existente],
};

const props = { campana, unidad: 'EV' as const, onCerrar: jest.fn(), onGuardado: jest.fn() };

beforeEach(() => jest.clearAllMocks());

describe('PanelPastoreo', () => {
  it('cambiar Cabezas actualiza Raciones con el resultado del motor', () => {
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    fireEvent.change(screen.getByLabelText('Cabezas'), { target: { value: '130' } });
    const esperado = calcularBorrador(campana, { ...existente, cabezas: 130 }).ev.raciones;
    expect(screen.getByTestId('raciones').textContent).toBe(num(esperado));
  });

  it('muestra el selector de Tabla 1 solo si el rodeo no usa Cocimano', () => {
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    expect(screen.queryByLabelText('Categoría de la Tabla 1')).toBeNull();
    fireEvent.change(screen.getByLabelText('Rodeo'), { target: { value: 'r2' } });
    expect(screen.getByLabelText('Categoría de la Tabla 1')).toBeTruthy();
  });

  it('con EV manual muestra «Manual» y lo envía en el body', async () => {
    (actualizarPastoreo as jest.Mock).mockResolvedValue({});
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    fireEvent.change(screen.getByLabelText('EV manual'), { target: { value: '0.9' } });
    expect(screen.getByTestId('fuente-ev').textContent).toBe('Manual');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(props.onGuardado).toHaveBeenCalled());
    expect(actualizarPastoreo).toHaveBeenCalledWith('c1', 'p1', {
      loteId: 'l1',
      rodeoId: 'r1',
      cabezas: 65,
      entrada: '2026-04-02',
      salida: '2026-04-28',
      categoriaTabla1Id: 'vacas-cria',
      evManual: 0.9,
    });
  });

  it('guarda uno nuevo con crearPastoreo y luego llama a onGuardado', async () => {
    (crearPastoreo as jest.Mock).mockResolvedValue({});
    render(<PanelPastoreo {...props} pastoreo={null} />);
    fireEvent.change(screen.getByLabelText('Lote'), { target: { value: 'l1' } });
    fireEvent.change(screen.getByLabelText('Rodeo'), { target: { value: 'r1' } });
    fireEvent.change(screen.getByLabelText('Cabezas'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Entrada'), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText('Salida'), { target: { value: '2026-05-10' } });
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(props.onGuardado).toHaveBeenCalled());
    expect(crearPastoreo).toHaveBeenCalledWith('c1', {
      loteId: 'l1',
      rodeoId: 'r1',
      cabezas: 50,
      entrada: '2026-05-01',
      salida: '2026-05-10',
      categoriaTabla1Id: null,
      evManual: null,
    });
  });

  it('muestra el error de la API y deja el panel abierto', async () => {
    (actualizarPastoreo as jest.Mock).mockRejectedValue(new ApiError(409, 'El rodeo ya está en otro lote'));
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('El rodeo ya está en otro lote')).toBeTruthy();
    expect(props.onGuardado).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeTruthy();
  });

  it('elimina un pastoreo existente en dos clics: Eliminar y Confirmar', async () => {
    (borrarPastoreo as jest.Mock).mockResolvedValue(undefined);
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(borrarPastoreo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(props.onGuardado).toHaveBeenCalled());
    expect(borrarPastoreo).toHaveBeenCalledWith('c1', 'p1');
  });

  it('en kg MS muestra las raciones y la carga de MS del motor', () => {
    render(<PanelPastoreo {...props} unidad="MS" pastoreo={existente} />);
    const fila = calcularBorrador(campana, existente);
    expect(fila.ms.raciones).not.toBe(fila.ev.raciones);
    expect(screen.getByTestId('raciones').textContent).toBe(num(fila.ms.raciones));
    expect(screen.getByTestId('carga').textContent).toBe(`${num(fila.ms.carga, 2)} kg MS/ha`);
  });

  it.each([
    ['Cabezas', '0'],
    ['Cabezas', '1.5'],
    ['EV manual', '1000'],
    ['EV manual', '0'],
  ])('deshabilita Guardar con %s = %s', (campo, valor) => {
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.change(screen.getByLabelText(campo), { target: { value: valor } });
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByLabelText(campo).getAttribute('aria-invalid')).toBe('true');
  });

  it('deshabilita Guardar con más decimales de los que admite el EV manual', () => {
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    fireEvent.change(screen.getByLabelText('EV manual'), { target: { value: '0.1234' } });
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('EV manual'), { target: { value: '0.123' } });
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it.each(['Cabezas', 'EV manual'])('deshabilita Guardar si %s tiene texto no parseable (badInput)', (campo) => {
    render(<PanelPastoreo {...props} pastoreo={{ ...existente, evManual: 0.5 }} />);
    const input = screen.getByLabelText(campo);
    Object.defineProperty(input, 'validity', { value: { badInput: true }, configurable: true });
    fireEvent.change(input, { target: { value: '' } });
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('es un diálogo modal con el título como nombre', () => {
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    const dialogo = screen.getByRole('dialog');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByRole('dialog', { name: 'Pastoreo' })).toBe(dialogo);
    expect(document.querySelector('.panel-scrim')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('al abrir enfoca el primer campo', () => {
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    expect(document.activeElement).toBe(screen.getByLabelText('Lote'));
  });

  it('al cerrar devuelve el foco a quien lo abrió', () => {
    const abridor = document.createElement('button');
    document.body.appendChild(abridor);
    abridor.focus();
    const { unmount } = render(<PanelPastoreo {...props} pastoreo={existente} />);
    expect(document.activeElement).not.toBe(abridor);
    unmount();
    expect(document.activeElement).toBe(abridor);
    abridor.remove();
  });

  it('Tab no sale del panel', () => {
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    const dialogo = screen.getByRole('dialog');
    const foco = Array.from(
      dialogo.querySelectorAll<HTMLElement>('button:not([disabled]), select, input'),
    );
    const primero = foco[0]!;
    const ultimo = foco[foco.length - 1]!;
    ultimo.focus();
    fireEvent.keyDown(ultimo, { key: 'Tab' });
    expect(document.activeElement).toBe(primero);
    primero.focus();
    fireEvent.keyDown(primero, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(ultimo);
  });

  it('las opciones vacías de los selectores tienen texto', () => {
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    const vacias = Array.from(document.querySelectorAll('option[value=""]'));
    expect(vacias.length).toBeGreaterThan(0);
    vacias.forEach((o) => expect(o.textContent).toBe('—'));
  });

  it('borrar el EV manual envía evManual: null', async () => {
    (actualizarPastoreo as jest.Mock).mockResolvedValue({});
    render(<PanelPastoreo {...props} pastoreo={{ ...existente, evManual: 0.9 }} />);
    fireEvent.change(screen.getByLabelText('EV manual'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(props.onGuardado).toHaveBeenCalled());
    expect((actualizarPastoreo as jest.Mock).mock.calls[0][2].evManual).toBeNull();
  });

  it('Escape cierra el panel', () => {
    render(<PanelPastoreo {...props} pastoreo={existente} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(props.onCerrar).toHaveBeenCalled();
  });

  it('si el pastoreo editado desaparece cierra el panel y nunca crea', () => {
    const { rerender } = render(<PanelPastoreo {...props} pastoreo={existente} />);
    rerender(
      <PanelPastoreo {...props} campana={{ ...campana, pastoreos: [] }} pastoreo={null} />,
    );
    expect(props.onCerrar).toHaveBeenCalled();
    expect(crearPastoreo).not.toHaveBeenCalled();
  });

  it('guarda con la campaña fijada al abrir aunque cambien las props', async () => {
    (actualizarPastoreo as jest.Mock).mockResolvedValue({});
    const { rerender } = render(<PanelPastoreo {...props} pastoreo={existente} />);
    rerender(<PanelPastoreo {...props} campana={{ ...campana, id: 'otra' }} pastoreo={existente} />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(props.onGuardado).toHaveBeenCalled());
    expect((actualizarPastoreo as jest.Mock).mock.calls[0].slice(0, 2)).toEqual(['c1', 'p1']);
  });
});
