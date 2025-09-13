import { useState, useCallback } from "react";
import { apiRequest } from "@/lib/api-request";

// useUpdateApi Hook
export function useUpdateApi<TData, TResponse>(
  config:
    | string
    | {
        endpoint: string;
        method?: "PUT" | "PATCH" | "POST";
      },
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

        const endpoint = typeof config === "string" ? config : config.endpoint;
        const method =
          typeof config === "string" ? "PATCH" : config.method || "PATCH";

        const result = await apiRequest<TResponse>(endpoint, {
          method,
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
    [config, options]
  );

  return { mutate, loading, error };
}
