import { useAsyncOptions } from "./useAsyncOptions";
import { fetchProductVariantOptions, OptionDto } from "../api/options";

export function useProductVariantOptions(params: {
  search?: string;
  enabled?: boolean;
} = {}) {
  const { search = "", enabled = true } = params;

  return useAsyncOptions<OptionDto>({
    key: "product-variants",
    enabled,
    search,
    fetchOptions: fetchProductVariantOptions,
  });
}
