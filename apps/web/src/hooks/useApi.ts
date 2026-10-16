import { useState, useCallback } from 'react';
import apiClient from '@/services/api';
import { useAppStore } from '@/store/appStore';

interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = unknown>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { setLoading } = useAppStore();

  const execute = useCallback(
    async (method: string, url: string, payload?: unknown) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient({
          method,
          url,
          data: payload,
        });

        setData(response.data);
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, options],
  );

  return { data, error, execute };
}
