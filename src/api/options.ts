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
    const response = await apiClient.get<ApiResponse<unknown>>(endpoint, {
      params: {
        [limitParam]: params.limit,
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
