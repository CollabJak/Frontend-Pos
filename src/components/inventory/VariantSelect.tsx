import AsyncSearchSelect from "../form/AsyncSearchSelect";
import Label from "../form/Label";
import { createOptionsFetcher, OptionDto } from "../../api/options";

type SelectOption = OptionDto & Record<string, unknown>;

interface VariantSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

const fetchVariantOptions = createOptionsFetcher<SelectOption>({
  endpoint: "/options/product-variants",
});

export default function VariantSelect({
  value,
  onChange,
  disabled = false,
  label = "Product Variant",
  placeholder = "Search product variant...",
}: VariantSelectProps) {
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
        debounceMs={400}
        searchMinLength={0}
        disabled={disabled}
      />
    </div>
  );
}
