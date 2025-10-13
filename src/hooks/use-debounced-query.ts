"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface UseDebouncedQueryOptions<TData, TError> {
  queryKey: (string | number | boolean | null | undefined)[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  debounceMs?: number;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
  retryDelay?: number;
}

export function useDebouncedQuery<TData, TError = Error>({
  queryKey,
  queryFn,
  enabled = true,
  debounceMs = 300,
  staleTime,
  gcTime,
  retry = 1,
  retryDelay = 1000,
}: UseDebouncedQueryOptions<TData, TError>) {
  const [debouncedQueryKey, setDebouncedQueryKey] = useState(queryKey);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQueryKey(queryKey);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [queryKey, debounceMs]);

  return useQuery({
    queryKey: debouncedQueryKey,
    queryFn,
    enabled: enabled && debouncedQueryKey === queryKey,
    staleTime,
    gcTime,
    retry,
    retryDelay,
  });
}
