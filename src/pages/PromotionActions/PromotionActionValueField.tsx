import type React from "react";
import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";

type ActionType =
  | "discount_percent"
  | "discount_amount"
  | "override_price"
  | "free_item"
  | "cashback"
  | "bundle_price";

export interface PromotionActionValueFieldErrors {
  value?: string;
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
    const itemName = toStringValue(value.item_name ?? value.item_code ?? value.item_id);
    const quantity = toStringValue(value.qty ?? value.quantity);

    return (
      <div className="space-y-3">
        <Label required>Nilai Aksi</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="free-item-name" className="mb-2" required>
              Item Gratis / Bonus
            </Label>
            <Input
              id="free-item-name"
              type="text"
              value={itemName}
              placeholder="Masukkan nama / kode item gratis"
              onChange={(event) =>
                onChange({
                  item_name: event.target.value,
                  qty: toNumberOrEmpty(quantity),
                })
              }
            />
            {fieldErrors.item_name && <p className="mt-1 text-sm text-red-500">{fieldErrors.item_name}</p>}
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
                  item_name: itemName,
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

  if (actionType === "bundle_price") {
    const qty = toStringValue(value.qty ?? value.min_qty ?? value.bundle_qty);
    const price = toStringValue(value.price ?? value.value);

    return (
      <div className="space-y-3">
        <Label required>Nilai Aksi</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="bundle-qty" className="mb-2" required>
              Jumlah Paket
            </Label>
            <Input
              id="bundle-qty"
              type="number"
              min="1"
              step="1"
              value={qty}
              placeholder="Masukkan jumlah paket"
              onChange={(event) =>
                onChange({
                  qty: toNumberOrEmpty(event.target.value),
                  price: toNumberOrEmpty(price),
                })
              }
            />
            {fieldErrors.qty && <p className="mt-1 text-sm text-red-500">{fieldErrors.qty}</p>}
          </div>
          <div>
            <Label htmlFor="bundle-price" className="mb-2" required>
              Harga Paket
            </Label>
            <Input
              id="bundle-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              placeholder="Masukkan harga paket"
              onChange={(event) =>
                onChange({
                  qty: toNumberOrEmpty(qty),
                  price: toNumberOrEmpty(event.target.value),
                })
              }
            />
            {fieldErrors.price && <p className="mt-1 text-sm text-red-500">{fieldErrors.price}</p>}
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
    bundle_price: "Nilai Aksi",
  };

  const inputPlaceholderMap: Record<ActionType, string> = {
    discount_percent: "Contoh: 10 (untuk 10%)",
    discount_amount: "Contoh: 10000",
    override_price: "Contoh: 15000",
    free_item: "Masukkan nilai aksi",
    cashback: "Contoh: 5000",
    bundle_price: "Masukkan nilai aksi",
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
