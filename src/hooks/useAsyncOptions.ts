import { useQuery } from "@tanstack/react-query";

export interface FetchOptionsParams {
  limit?: number;
  search?: string;
  signal?: AbortSignal;
}

export type FetchOptionsFn<TOption> = (params: FetchOptionsParams) => Promise<TOption[]>;

interface UseAsyncOptionsParams<TOption> {
  key: string;
  enabled: boolean;
  limit?: number;
  search?: string;
  fetchOptions: FetchOptionsFn<TOption>;
}

export function useAsyncOptions<TOption>({
  key,
  enabled,
  limit,
  search,
  fetchOptions,
}: UseAsyncOptionsParams<TOption>) {
  return useQuery<TOption[]>({
    queryKey: ["async-options", key, search ?? "", limit],
    queryFn: ({ signal }) => fetchOptions({ limit, search, signal }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
