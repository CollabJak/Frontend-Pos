import { useAsyncOptions } from "./useAsyncOptions";
import { fetchRotationPatternOptions, OptionDto } from "../api/options";

export function useRotationPatternOptions(params: {
  search?: string;
  enabled?: boolean;
} = {}) {
  const { search = "", enabled = true } = params;

  return useAsyncOptions<OptionDto>({
    key: "rotation-patterns",
    enabled,
    search,
    fetchOptions: fetchRotationPatternOptions,
  });
}
