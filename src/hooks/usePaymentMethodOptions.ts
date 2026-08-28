import { useAsyncOptions } from "./useAsyncOptions";
import { fetchPaymentMethodOptions, OptionDto } from "../api/options";

export function usePaymentMethodOptions(params: {
  search?: string;
  enabled?: boolean;
} = {}) {
  const { search = "", enabled = true } = params;

  return useAsyncOptions<OptionDto>({
    key: "payment-methods",
    enabled,
    search,
    fetchOptions: fetchPaymentMethodOptions,
  });
}
