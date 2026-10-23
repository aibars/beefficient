import { apiClient, AuthError } from '../../lib/api-client';
import { API_BASE_URL, ENDPOINTS } from '../../lib/api-constants';

// Helper to create mock Response objects
function createMockResponse(body: unknown, status: number): Response {
  const bodyText = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    json: async () => {
      if (bodyText === 'not json') {
        throw new Error('Invalid JSON');
      }
      return JSON.parse(bodyText);
    },
    text: async () => bodyText,
  } as Response;
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Set up localStorage mock
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
}

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should add Authorization header with token from localStorage', async () => {
    localStorage.setItem('auth_token', 'test-token-123');
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockResponse({ success: true }, 200)
    );

    await apiClient.fetch('/grazing');

    const callArgs = (global.fetch as jest.Mock).mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token-123');
  });

  it('should set Content-Type header to application/json by default', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockResponse({ success: true }, 200)
    );

    await apiClient.fetch('/grazing');

    const callArgs = (global.fetch as jest.Mock).mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('should build full URL with API_BASE_URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockResponse({ success: true }, 200)
    );

    await apiClient.fetch('/grazing');

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/grazing`,
      expect.any(Object)
    );
  });

  it('should return parsed JSON response', async () => {
    const mockData = { id: '1', name: 'Test' };
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockResponse(mockData, 200)
    );

    const result = await apiClient.fetch('/grazing');

    expect(result).toEqual(mockData);
  });

  it('should refresh token on 401 and retry request', async () => {
    localStorage.setItem('auth_token', 'old-token');
    const mockData = { id: '1', name: 'Test' };

    // First call returns 401, second call (refresh) returns 200, third call (retry) returns 200
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        createMockResponse({}, 401)
      )
      .mockResolvedValueOnce(
        createMockResponse({ access_token: 'new-token' }, 200)
      )
      .mockResolvedValueOnce(
        createMockResponse(mockData, 200)
      );

    const result = await apiClient.fetch('/grazing');

    expect(result).toEqual(mockData);
    // Verify token was updated
    expect(localStorage.getItem('auth_token')).toBe('new-token');
    // Verify fetch was called 3 times: original, refresh, retry
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should throw AuthError if refresh token fails', async () => {
    localStorage.setItem('auth_token', 'old-token');

    // First call returns 401, second call (refresh) returns 401
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        createMockResponse({}, 401)
      )
      .mockResolvedValueOnce(
        createMockResponse({}, 401)
      );

    await expect(apiClient.fetch('/grazing')).rejects.toThrow(AuthError);
    // Verify token was cleared
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should throw error on 4xx/5xx response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockResponse({ message: 'Not found' }, 404)
    );

    await expect(apiClient.fetch('/grazing')).rejects.toThrow('API error 404');
  });

  it('should handle 204 No Content response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockResponse(null, 204)
    );

    const result = await apiClient.fetch('/grazing');

    expect(result).toBeUndefined();
  });

  it('should not include token header if no token in localStorage', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockResponse({ success: true }, 200)
    );

    await apiClient.fetch('/grazing');

    const callArgs = (global.fetch as jest.Mock).mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('should throw error if response is not valid JSON', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      createMockResponse('not json', 200)
    );

    await expect(apiClient.fetch('/grazing')).rejects.toThrow('Failed to parse API response as JSON');
  });
});
