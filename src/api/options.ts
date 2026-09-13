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

export type OptionsFetcher<TOption> = {
  (params: {
    limit?: number;
    search?: string;
    signal?: AbortSignal;
  }): Promise<TOption[]>;
  /** Domain name used to isolate the dropdown options cache entry. */
  optionsKey: string;
};

const MAX_OPTIONS_LIMIT = 100;

export function createOptionsFetcher<TOption = OptionDto>({
  endpoint,
  limitParam = "limit",
  searchParam = "search",
}: CreateOptionsFetcherParams) {
  const fetcher = async (params: {
    limit?: number;
    search?: string;
    signal?: AbortSignal;
  }): Promise<TOption[]> => {
    const queryParams: Record<string, any> = {};

    if (params.limit && params.limit > 0) {
      queryParams[limitParam] = Math.min(MAX_OPTIONS_LIMIT, Math.floor(params.limit));
    }

    if (params.search) {
      queryParams[searchParam] = params.search;
    }

    const response = await apiClient.get<ApiResponse<unknown>>(endpoint, {
      params: queryParams,
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

  // Cache key for dropdown options, derived from the endpoint so every
  // AsyncSearchSelect instance is isolated even when no keyName is passed.
  (fetcher as OptionsFetcher<TOption>).optionsKey = endpoint.replace(/^\/options\//, "");
  return fetcher;
}

export const fetchCategoryOptions = createOptionsFetcher({ endpoint: "/options/categories" });
export const fetchBrandOptions = createOptionsFetcher({ endpoint: "/options/brands" });
export const fetchUnitOptions = createOptionsFetcher({ endpoint: "/options/units" });
export const fetchProductOptions = createOptionsFetcher({ endpoint: "/options/products" });
export const fetchProductVariantOptions = createOptionsFetcher({ endpoint: "/options/product-variants" });
export const fetchCustomerGroupOptions = createOptionsFetcher({ endpoint: "/options/customer-groups" });
export const fetchCustomerOptions = createOptionsFetcher({ endpoint: "/options/customers" });
export const fetchAtributeOptions = createOptionsFetcher({ endpoint: "/options/atributes" });
export const fetchLocationOptions = createOptionsFetcher({ endpoint: "/options/locations" });
export const fetchPromotionOptions = createOptionsFetcher({ endpoint: "/options/promotions" });
export const fetchShiftOptions = createOptionsFetcher({ endpoint: "/options/shifts" });
export const fetchUserOptions = createOptionsFetcher({ endpoint: "/options/users" });
export const fetchRotationPatternOptions = createOptionsFetcher({ endpoint: "/options/rotation-patterns" });
export const fetchPaymentMethodOptions = createOptionsFetcher({ endpoint: "/options/payment-methods" });

