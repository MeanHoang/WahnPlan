import { useState, useCallback } from "react";
import { apiRequest } from "@/lib/api-request";

// useCreateApi Hook
export function useCreateApi<TData, TResponse>(
  url: string,
  options?: {
    onSuccess?: (data: TResponse) => void;
    onError?: (error: Error) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (data: TData) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiRequest<TResponse>(url, {
          method: "POST",
          body: data,
        });
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [url, options]
  );

  return { mutate, loading, error };
}
