import { useState, useEffect, useCallback, useMemo } from "react";
import { apiRequest } from "@/lib/api-request";

// useFetchApi Hook
export function useFetchApi<T>(
  url: string,
  query?: Record<string, any>,
  options?: {
    enabled?: boolean;
    refetchOnMount?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize query to prevent infinite loops
  const memoizedQuery = useMemo(() => query || {}, [JSON.stringify(query)]);

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiRequest<T>(url, { query: memoizedQuery });
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url, memoizedQuery, options?.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
