import apiClient from "./axiosConfig";
import { ApiResponse } from "../types/api";

export interface OptionDto {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface CreateOptionsFetcherParams {
  endpoint: string;
  limitParam?: string;
  searchParam?: string;
}

const MAX_OPTIONS_LIMIT = 100;

export function createOptionsFetcher<TOption = OptionDto>({
  endpoint,
  limitParam = "limit",
  searchParam = "search",
}: CreateOptionsFetcherParams) {
  return async (params: {
    limit: number;
    search?: string;
    signal?: AbortSignal;
  }): Promise<TOption[]> => {
    const normalizedLimit = Math.min(
      MAX_OPTIONS_LIMIT,
      Math.max(1, Math.floor(params.limit))
    );

    const response = await apiClient.get<ApiResponse<unknown>>(endpoint, {
      params: {
        [limitParam]: normalizedLimit,
        ...(params.search ? { [searchParam]: params.search } : {}),
      },
      signal: params.signal,
    });

    const payload = response.data.data as
      | TOption[]
      | { data?: TOption[] }
      | null
      | undefined;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }

    return [];
  };
}
