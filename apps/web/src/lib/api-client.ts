import { API_BASE_URL, ENDPOINTS } from './api-constants';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body.message) {
      return body.message;
    }
  } catch {
    // Fall through to default message
  }
  return response.statusText || `Request failed with status ${response.status}`;
}

export const apiClient = {
  async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const fullUrl = `${API_BASE_URL}${url}`;
    const headers = new Headers(options?.headers || {});

    // Set default Content-Type
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add authorization header if token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    let response = await fetch(fullUrl, fetchOptions);

    // Handle 401 by attempting token refresh
    if (response.status === 401 && token) {
      try {
        // Attempt token refresh
        const refreshUrl = `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`;
        const refreshHeaders = new Headers();
        refreshHeaders.set('Content-Type', 'application/json');
        refreshHeaders.set('Authorization', `Bearer ${token}`);

        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          headers: refreshHeaders,
        });

        if (!refreshResponse.ok) {
          // Refresh failed - clear token and throw AuthError
          localStorage.removeItem('auth_token');
          throw new AuthError('Token refresh failed. Please log in again.');
        }

        const refreshData = (await refreshResponse.json()) as { access_token?: string };
        const newToken = refreshData.access_token;

        if (!newToken) {
          localStorage.removeItem('auth_token');
          throw new AuthError('No token in refresh response. Please log in again.');
        }

        // Store new token
        localStorage.setItem('auth_token', newToken);

        // Retry original request with new token
        const retryHeaders = new Headers(options?.headers || {});
        if (!retryHeaders.has('Content-Type')) {
          retryHeaders.set('Content-Type', 'application/json');
        }
        retryHeaders.set('Authorization', `Bearer ${newToken}`);

        response = await fetch(fullUrl, {
          ...options,
          headers: retryHeaders,
        });
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }
        // Clear token on any other error and throw AuthError
        localStorage.removeItem('auth_token');
        throw new AuthError('Authentication failed. Please log in again.');
      }
    }

    // Handle other error status codes
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(`API error ${response.status}: ${errorMessage}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse and return JSON response
    try {
      const data = (await response.json()) as T;
      return data;
    } catch (error) {
      throw new Error('Failed to parse API response as JSON');
    }
  },
};
