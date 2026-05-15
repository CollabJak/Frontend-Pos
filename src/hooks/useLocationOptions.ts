import { useAsyncOptions } from "./useAsyncOptions";
import { fetchLocationOptions, OptionDto } from "../api/options";

export function useLocationOptions(params: {
  search?: string;
  enabled?: boolean;
} = {}) {
  const { search = "", enabled = true } = params;

  return useAsyncOptions<OptionDto>({
    key: "locations",
    enabled,
    search,
    fetchOptions: fetchLocationOptions,
  });
}
