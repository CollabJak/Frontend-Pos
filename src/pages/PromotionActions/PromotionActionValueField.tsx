import type React from "react";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";
import AsyncSearchSelect from "../../components/form/AsyncSearchSelect";
import { fetchProductVariantOptions, OptionDto } from "../../api/options";

type SelectOption = OptionDto & Record<string, unknown>;

type ActionType =
  | "discount_percent"
  | "discount_amount"
  | "override_price"
  | "free_item"
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

  if (actionType === "free_item") {
    const rawVariantId = value.product_variant_id ?? value.item_id;
    const variantId = rawVariantId ? Number(rawVariantId) : null;
    const variantLabel = toStringValue(
      value.product_variant_name ??
      value.item_name ??
      value.item_code ??
      (variantId ? `Varian #${variantId}` : "")
    );
    const quantity = toStringValue(value.qty ?? value.quantity ?? 1);

    return (
      <div className="space-y-3">
        <Label required>Nilai Aksi</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="free-item-variant" className="mb-2" required>
              Varian Produk Gratis
            </Label>
            <AsyncSearchSelect<SelectOption>
              label=""
              keyName="free-item-variant"
              value={variantId}
              displayValue={variantLabel}
              onChange={(selectedValue, option) => {
                const optName = option?.name ? String(option.name) : "";
                onChange({
                  product_variant_id: selectedValue ? Number(selectedValue) : null,
                  product_variant_name: optName || (selectedValue ? `Varian #${selectedValue}` : ""),
                  qty: toNumberOrEmpty(quantity) || 1,
                });
              }}
              placeholder="Cari varian produk gratis..."
              fetchOptions={fetchProductVariantOptions}
              optionLabel="name"
              optionValue="id"
              debounceMs={400}
              searchMinLength={0}
            />
            {(fieldErrors.product_variant_id || fieldErrors.item_name) && (
              <p className="mt-1 text-sm text-red-500">
                {fieldErrors.product_variant_id || fieldErrors.item_name}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="free-item-qty" className="mb-2" required>
              Jumlah
            </Label>
            <Input
              id="free-item-qty"
              type="number"
              min="1"
              step="1"
              value={quantity}
              placeholder="Masukkan jumlah"
              onChange={(event) =>
                onChange({
                  ...(variantId ? { product_variant_id: variantId } : {}),
                  ...(variantLabel ? { product_variant_name: variantLabel } : {}),
                  qty: toNumberOrEmpty(event.target.value),
                })
              }
            />
            {fieldErrors.qty && <p className="mt-1 text-sm text-red-500">{fieldErrors.qty}</p>}
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    );
  }


  const inputLabelMap: Record<ActionType, string> = {
    discount_percent: "Persentase Diskon (%)",
    discount_amount: "Jumlah Diskon (Rp)",
    override_price: "Harga Khusus / Baru (Rp)",
    free_item: "Nilai Aksi",
    cashback: "Jumlah Cashback (Rp)",
  };

  const inputPlaceholderMap: Record<ActionType, string> = {
    discount_percent: "Contoh: 10 (untuk 10%)",
    discount_amount: "Contoh: 10000",
    override_price: "Contoh: 15000",
    free_item: "Masukkan nilai aksi",
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
