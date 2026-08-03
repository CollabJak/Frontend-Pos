import AsyncSearchSelect from "../form/AsyncSearchSelect";
import Label from "../form/Label";
import apiClient from "../../api/axiosConfig";
import type { ApiResponse } from "../../types/api";
import type { OptionDto } from "../../api/options";

type SelectOption = OptionDto & Record<string, unknown>;

interface VariantSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  locationId?: number | null;
  label?: string;
  placeholder?: string;
}

export default function VariantSelect({
  value,
  onChange,
  disabled = false,
  locationId = null,
  label = "Varian Produk",
  placeholder = "Cari varian produk...",
}: VariantSelectProps) {
  const fetchVariantOptions = async (params: {
    limit: number;
    search?: string;
    signal?: AbortSignal;
  }): Promise<SelectOption[]> => {
    const response = await apiClient.get<ApiResponse<unknown>>("/options/product-variants", {
      params: {
        limit: params.limit,
        ...(params.search ? { search: params.search } : {}),
        ...(locationId ? { location_id: locationId } : {}),
      },
      signal: params.signal,
    });

    const payload = response.data.data as SelectOption[] | { data?: SelectOption[] } | null | undefined;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }

    return [];
  };

  return (
    <div>
      <Label>{label}</Label>
      <AsyncSearchSelect<SelectOption>
        label=""
        value={value}
        onChange={(selectedValue) => {
          onChange(selectedValue != null ? Number(selectedValue) : null);
        }}
        placeholder={placeholder}
        fetchOptions={fetchVariantOptions}
        optionLabel="name"
        optionValue="id"
        keyName={`product-variants-${locationId ?? "all"}`}
        debounceMs={400}
        searchMinLength={0}
        disabled={disabled}
      />
    </div>
  );
}
