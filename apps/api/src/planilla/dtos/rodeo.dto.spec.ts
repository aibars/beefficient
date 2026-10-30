import { CATEGORIAS_RODEO, DURACIONES_SERVICIO } from '@beefficient/domain';
import { CATEGORIAS_RODEO_API, DURACIONES_SERVICIO_API } from './rodeo.dto';

describe('rodeo.dto: copias literales del dominio', () => {
  it('las categorías coinciden con CATEGORIAS_RODEO', () => {
    expect(CATEGORIAS_RODEO_API).toEqual(CATEGORIAS_RODEO);
  });
  it('las duraciones coinciden con DURACIONES_SERVICIO', () => {
    expect(DURACIONES_SERVICIO_API).toEqual(DURACIONES_SERVICIO);
  });
});
