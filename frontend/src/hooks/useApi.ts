"use client";

import { useState, useEffect, useCallback } from "react";

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T, A extends any[]> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: A) => Promise<T | null>;
  refetch: () => Promise<T | null>;
}

export function useApi<T, A extends any[] = []>(
  apiFunction: (...args: A) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, A> {
  const { immediate = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const [args, setArgs] = useState<A | null>(null);

  const execute = useCallback(
    async (...executeArgs: A): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      setArgs(executeArgs);

      try {
        const result = await apiFunction(...executeArgs);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const refetch = useCallback(async (): Promise<T | null> => {
    if (args) {
      return execute(...args);
    }
    return execute(...([] as unknown as A));
  }, [args, execute]);

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as A));
    }
  }, []);

  return { data, isLoading, error, execute, refetch };
}
