import { useQuery } from "@tanstack/react-query";
import { OPTIONS_QUERY_KEY } from "../constants/queryKeys";

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
    queryKey: [OPTIONS_QUERY_KEY, key, search ?? "", limit],
    queryFn: ({ signal }) => fetchOptions({ limit, search, signal }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000, // 30 seconds fresh cache, instant invalidate on mutation
  });
}
