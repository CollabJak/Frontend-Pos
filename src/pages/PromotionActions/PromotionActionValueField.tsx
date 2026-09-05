import type React from "react";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";

type ActionType =
  | "discount_percent"
  | "discount_amount"
  | "cashback";

export interface PromotionActionValueFieldErrors {
  value?: string;
  product_variant_id?: string;
  item_name?: string;
  qty?: string;
  price?: string;
}

export interface PromotionActionValueFieldProps {
  actionType: ActionType;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  error?: string;
  fieldErrors?: PromotionActionValueFieldErrors;
}

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
};

const toNumberOrEmpty = (value: string): number | string => {
  if (value.trim() === "") {
    return "";
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? value : numericValue;
};

export const PromotionActionValueField: React.FC<PromotionActionValueFieldProps> = ({
  actionType,
  value,
  onChange,
  error,
  fieldErrors = {},
}) => {
  const primaryValue = toStringValue(value.value ?? value.amount ?? value.price ?? value.percent);

  const inputLabelMap: Record<ActionType, string> = {
    discount_percent: "Persentase Diskon (%)",
    discount_amount: "Jumlah Diskon (Rp)",
    cashback: "Jumlah Cashback (Rp)",
  };

  const inputPlaceholderMap: Record<ActionType, string> = {
    discount_percent: "Contoh: 10 (untuk 10%)",
    discount_amount: "Contoh: 10000",
    cashback: "Contoh: 5000",
  };

  const currentFieldError = fieldErrors.value || error;

  return (
    <div className="space-y-3">
      <Label htmlFor="promotion-action-value" required>
        {inputLabelMap[actionType] || "Nilai Aksi"}
      </Label>
      <Input
        id="promotion-action-value"
        type="number"
        min="0"
        step="0.01"
        value={primaryValue}
        placeholder={inputPlaceholderMap[actionType] || "Masukkan nilai aksi"}
        onChange={(event) => onChange({ value: toNumberOrEmpty(event.target.value) })}
      />
      {currentFieldError && <p className="text-sm text-red-500">{currentFieldError}</p>}
    </div>
  );
};

export default PromotionActionValueField;
