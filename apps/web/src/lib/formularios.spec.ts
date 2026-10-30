import { aNumero, aTexto, mensajeDe } from './formularios';

describe('formularios', () => {
  it('aTexto pasa un número (o nada) al texto de un input', () => {
    expect(aTexto(35)).toBe('35');
    expect(aTexto(0)).toBe('0');
    expect(aTexto(null)).toBe('');
    expect(aTexto(undefined)).toBe('');
  });

  it('aNumero pasa el texto a número y el vacío a null', () => {
    expect(aNumero('12.5')).toBe(12.5);
    expect(aNumero('  ')).toBeNull();
    expect(aNumero('')).toBeNull();
  });

  it('mensajeDe usa el mensaje del Error o el genérico', () => {
    expect(mensajeDe(new Error('Algo falló'))).toBe('Algo falló');
    expect(mensajeDe('x')).toBe('Ocurrió un error inesperado.');
  });
});
