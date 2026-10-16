/**
 * JWT access-token persistence. Lives apart from `api.ts` and
 * `services/auth.service.ts` so both can use it without a circular import.
 *
 * Every accessor is guarded: during the static export build there is no
 * `window`, and in a private window or with blocked site data `localStorage`
 * can throw.
 */

export const TOKEN_STORAGE_KEY = 'beefficient-auth-token';

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readToken(): string | null {
  try {
    return storage()?.getItem(TOKEN_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function writeToken(token: string): void {
  try {
    storage()?.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Storage unavailable: the session simply won't survive a reload.
  }
}

export function clearToken(): void {
  try {
    storage()?.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
