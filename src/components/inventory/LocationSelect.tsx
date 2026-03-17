import AsyncSearchSelect from "../form/AsyncSearchSelect";
import Label from "../form/Label";
import { createOptionsFetcher, OptionDto } from "../../api/options";

type SelectOption = OptionDto & Record<string, unknown>;

interface LocationSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

const fetchLocationOptions = createOptionsFetcher<SelectOption>({
  endpoint: "/options/locations",
});

export default function LocationSelect({
  value,
  onChange,
  disabled = false,
  label = "Location",
  placeholder = "Search location...",
}: LocationSelectProps) {
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
        fetchOptions={fetchLocationOptions}
        optionLabel="name"
        optionValue="id"
        debounceMs={400}
        searchMinLength={0}
        disabled={disabled}
      />
    </div>
  );
}
