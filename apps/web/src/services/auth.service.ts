import { ApiError, API_URL, getApiToken, setApiToken } from '@/lib/api';
import { clearToken } from '@/lib/tokenStorage';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

/**
 * Logs in against `POST /auth/login` and stores the access token.
 * Uses fetch directly (not apiFetch) because apiFetch maps every 401 to
 * "session expired", which is wrong for invalid credentials.
 */
export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser }> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
  } catch {
    throw new ApiError(0, 'No se puede conectar al servidor');
  }

  if (res.status === 401) {
    throw new ApiError(401, 'Correo o contraseña incorrectos');
  }
  if (res.status === 400) {
    throw new ApiError(400, 'Verifica tu entrada');
  }
  if (!res.ok) {
    throw new ApiError(res.status, 'No se pudo iniciar sesión. Intentá de nuevo.');
  }

  const body = (await res.json()) as LoginResponse;
  if (!body?.accessToken) {
    throw new ApiError(500, 'Respuesta inválida del servidor');
  }
  setApiToken(body.accessToken);
  return { user: body.user };
}

export function logout(): void {
  clearToken();
}

export function isAuthenticated(): boolean {
  return !!getApiToken();
}
