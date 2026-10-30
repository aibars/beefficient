import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { enRango, RANGOS, useCampoNumerico } from './rangos';

describe('enRango', () => {
  it('acepta vacío y valores dentro de los límites', () => {
    expect(enRango('', RANGOS.cabezas)).toBe(true);
    expect(enRango('1', RANGOS.cabezas)).toBe(true);
    expect(enRango('0.001', RANGOS.evManual)).toBe(true);
    expect(enRango('100', RANGOS.eficiencia)).toBe(true);
  });

  it('rechaza fuera de rango, no enteros donde va entero y texto no numérico', () => {
    expect(enRango('0', RANGOS.cabezas)).toBe(false);
    expect(enRango('2.5', RANGOS.cabezas)).toBe(false);
    expect(enRango('1000', RANGOS.evManual)).toBe(false);
    expect(enRango('0', RANGOS.hectareas)).toBe(false);
    expect(enRango('100000', RANGOS.pesoVivo)).toBe(false);
    expect(enRango('abc', RANGOS.eficiencia)).toBe(false);
  });

  it('rechaza más decimales de los que admite el step', () => {
    expect(enRango('0.123', RANGOS.evManual)).toBe(true);
    expect(enRango('0.1234', RANGOS.evManual)).toBe(false);
    expect(enRango('50.25', RANGOS.eficiencia)).toBe(true);
    expect(enRango('50.255', RANGOS.eficiencia)).toBe(false);
    expect(enRango('12.345', RANGOS.hectareas)).toBe(false);
    expect(enRango('420.5', RANGOS.pesoVivo)).toBe(true);
  });
});

describe('useCampoNumerico', () => {
  const cambio = (value: string, badInput: boolean) =>
    ({ target: { value, validity: { badInput } } }) as unknown as ChangeEvent<HTMLInputElement>;

  it('es válido con un valor en rango y se invalida con texto fuera de rango', () => {
    const { result } = renderHook(() => useCampoNumerico('50', RANGOS.eficiencia));
    expect(result.current.ok).toBe(true);
    act(() => result.current.props.onChange(cambio('50.255', false)));
    expect(result.current.texto).toBe('50.255');
    expect(result.current.ok).toBe(false);
  });

  it('un texto no parseable (value vacío con badInput) lo invalida', () => {
    const { result } = renderHook(() => useCampoNumerico('50', RANGOS.eficiencia));
    act(() => result.current.props.onChange(cambio('', true)));
    expect(result.current.ok).toBe(false);
    expect(result.current.props['aria-invalid']).toBe(true);
    act(() => result.current.props.onChange(cambio('60', false)));
    expect(result.current.ok).toBe(true);
  });

  it('asignar el texto desde afuera limpia el badInput', () => {
    const { result } = renderHook(() => useCampoNumerico('', RANGOS.hectareas));
    act(() => result.current.props.onChange(cambio('', true)));
    act(() => result.current.setTexto('30'));
    expect(result.current.ok).toBe(true);
  });
});
