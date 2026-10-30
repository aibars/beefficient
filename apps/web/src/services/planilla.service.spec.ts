import { calcularCampana } from '@beefficient/domain';
import { API_URL, ApiError } from '@/lib/api';
import {
  borrarLote,
  crearPastoreo,
  obtenerCampana,
  type CampanaCompleta,
} from './planilla.service';

function mockResponse(body: unknown, status: number): Response {
  const text = body === undefined ? '' : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    json: async () => JSON.parse(text),
    text: async () => text,
  } as Response;
}

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

beforeEach(() => fetchMock.mockReset());

describe('planilla.service', () => {
  it('obtenerCampana pide GET /campanas/:id y desenvuelve data', async () => {
    const campana = { id: 'c1', anio: 2026, mesServicio: 1, eficienciaCosecha: 50, lotes: [], rodeos: [], pastoreos: [] };
    fetchMock.mockResolvedValue(mockResponse({ data: campana }, 200));
    await expect(obtenerCampana('c1')).resolves.toEqual(campana);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/campanas/c1`);
  });

  it('crearPastoreo hace POST con el body JSON', async () => {
    fetchMock.mockResolvedValue(mockResponse({ data: { id: 'p1', loteId: 'l1' } }, 201));
    const r = await crearPastoreo('c1', { loteId: 'l1' });
    expect(r).toEqual({ id: 'p1', loteId: 'l1' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/campanas/c1/pastoreos`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ loteId: 'l1' });
  });

  it('borrarLote acepta 204', async () => {
    fetchMock.mockResolvedValue(mockResponse(undefined, 204));
    await expect(borrarLote('l1')).resolves.toBeUndefined();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/lotes/l1`);
    expect(init.method).toBe('DELETE');
  });

  it('un 409 se convierte en ApiError con el mensaje de la API', async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ message: 'No tenés un establecimiento activo.' }, 409),
    );
    const err = await obtenerCampana('c1').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    expect(err.message).toBe('No tenés un establecimiento activo.');
  });

  it('Jest resuelve @beefficient/domain y calcula una campaña vacía', () => {
    const c: CampanaCompleta = { id: 'c1', anio: 2026, mesServicio: 1, eficienciaCosecha: 50, lotes: [], rodeos: [], pastoreos: [] };
    expect(calcularCampana(c).filas).toEqual([]);
  });
});
