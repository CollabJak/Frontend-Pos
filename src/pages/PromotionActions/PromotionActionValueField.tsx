import Label from "../../components/form/Label";
import { Input } from "../../components/form/input/InputField";

type ActionType =
  | "discount_percent"
  | "discount_amount"
  | "override_price"
  | "free_item"
  | "cashback"
  | "bundle_price";

interface PromotionActionValueFieldProps {
  actionType: ActionType;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  error?: string;
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

export default function PromotionActionValueField({
  actionType,
  value,
  onChange,
  error,
}: PromotionActionValueFieldProps) {
  const primaryValue = toStringValue(value.value ?? value.amount ?? value.price ?? value.percent);

  if (actionType === "free_item") {
    const itemName = toStringValue(value.item_name ?? value.item_code ?? value.item_id);
    const quantity = toStringValue(value.qty ?? value.quantity);

    return (
      <div className="space-y-3">
        <Label>Nilai Aksi</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="free-item-name" className="mb-2">
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
          </div>
          <div>
            <Label htmlFor="free-item-qty" className="mb-2">
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
        <Label>Nilai Aksi</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="bundle-qty" className="mb-2">
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
          </div>
          <div>
            <Label htmlFor="bundle-price" className="mb-2">
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
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    );
  }

  const inputLabelMap: Record<ActionType, string> = {
    discount_percent: "Persentase Diskon (%)",
    discount_amount: "Jumlah Diskon (Rp)",
    override_price: "Harga Khusus / Baru",
    free_item: "Nilai Aksi",
    cashback: "Jumlah Cashback",
    bundle_price: "Nilai Aksi",
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="promotion-action-value">{inputLabelMap[actionType] || "Nilai Aksi"}</Label>
      <Input
        id="promotion-action-value"
        type="number"
        min="0"
        step="0.01"
        value={primaryValue}
        placeholder="Masukkan nilai aksi"
        onChange={(event) => onChange({ value: toNumberOrEmpty(event.target.value) })}
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
