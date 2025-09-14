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
    async (
      data: TData,
      overrideConfig?: {
        endpoint: string;
        method?: "PUT" | "PATCH" | "POST";
      }
    ) => {
      try {
        setLoading(true);
        setError(null);

        const finalConfig = overrideConfig || config;
        const endpoint =
          typeof finalConfig === "string" ? finalConfig : finalConfig.endpoint;
        const method =
          typeof finalConfig === "string"
            ? "PATCH"
            : finalConfig.method || "PATCH";

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
