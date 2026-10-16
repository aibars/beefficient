import { clearToken, readToken, writeToken } from './tokenStorage';

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function setApiToken(token: string): void {
  writeToken(token);
}

export function getApiToken(): string | null {
  return readToken();
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const msg = body?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  } catch {
    // Non-JSON body: fall through.
  }
  return res.statusText || `Request failed (${res.status})`;
}

/** Fetches `endpoint` from the API with the JWT attached and returns parsed JSON. */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getApiToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Intentá de nuevo.');
  }

  if (res.status === 401) {
    clearToken();
    throw new ApiError(401, 'Sesión expirada. Iniciá sesión nuevamente.');
  }
  if (!res.ok) {
    throw new ApiError(res.status, await errorMessage(res));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Builds a query string, skipping undefined/null/empty values. */
export function buildQuery(
  params: Record<string, string | number | undefined | null>,
): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}
