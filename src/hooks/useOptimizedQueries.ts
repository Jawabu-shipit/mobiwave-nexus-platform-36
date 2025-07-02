
import { useQuery } from '@tanstack/react-query';

interface QueryConfig<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useOptimizedQuery<T>(config: QueryConfig<T>) {
  return useQuery({
    queryKey: config.queryKey,
    queryFn: config.queryFn,
    enabled: config.enabled ?? true,
    staleTime: config.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: config.gcTime ?? 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && 'status' in error && typeof error.status === 'number') {
        return error.status >= 500 && failureCount < 2;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
