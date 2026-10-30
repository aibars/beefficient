import { API_URL } from '@/lib/api';
import { activarEstablecimiento, listarEstablecimientos } from './farms.service';

function mockResponse(body: unknown, status: number): Response {
  const text = body === undefined ? '' : JSON.stringify(body);
  return { ok: status < 300, status, statusText: '', json: async () => JSON.parse(text), text: async () => text } as Response;
}
const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;
beforeEach(() => fetchMock.mockReset());

describe('farms.service', () => {
  it('listarEstablecimientos mapea farm_name a nombre', async () => {
    fetchMock.mockResolvedValue(mockResponse({ farms: [
      { farm_id: 'f1', farm_name: 'La Esperanza', provincia: 'BA', role: 'owner', active: true, join_code: 'x' },
      { farm_id: 'f2', farm_name: 'El Ombú', provincia: 'SF', role: 'member', active: false, join_code: 'y' },
    ] }, 200));
    await expect(listarEstablecimientos()).resolves.toEqual([
      { id: 'f1', nombre: 'La Esperanza', activo: true },
      { id: 'f2', nombre: 'El Ombú', activo: false },
    ]);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/auth/farms`);
  });

  it('activarEstablecimiento hace PATCH /auth/farm/:id/active', async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true }, 200));
    await expect(activarEstablecimiento('f2')).resolves.toBeUndefined();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/auth/farm/f2/active`);
    expect(init.method).toBe('PATCH');
  });
});
