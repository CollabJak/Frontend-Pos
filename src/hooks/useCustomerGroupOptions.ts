import { useAsyncOptions } from "./useAsyncOptions";
import { fetchCustomerGroupOptions, OptionDto } from "../api/options";

export function useCustomerGroupOptions(params: {
  search?: string;
  enabled?: boolean;
} = {}) {
  const { search = "", enabled = true } = params;

  return useAsyncOptions<OptionDto>({
    key: "customer-groups",
    enabled,
    search,
    fetchOptions: fetchCustomerGroupOptions,
  });
}
