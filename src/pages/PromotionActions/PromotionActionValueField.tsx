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
        <Label>Action Value</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="free-item-name" className="mb-2">
              Free Item
            </Label>
            <Input
              id="free-item-name"
              type="text"
              value={itemName}
              placeholder="Input free item name/code"
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
              Quantity
            </Label>
            <Input
              id="free-item-qty"
              type="number"
              min="1"
              step="1"
              value={quantity}
              placeholder="Input quantity"
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
        <Label>Action Value</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="bundle-qty" className="mb-2">
              Bundle Qty
            </Label>
            <Input
              id="bundle-qty"
              type="number"
              min="1"
              step="1"
              value={qty}
              placeholder="Input bundle qty"
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
              Bundle Price
            </Label>
            <Input
              id="bundle-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              placeholder="Input bundle price"
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
    discount_percent: "Discount Percent",
    discount_amount: "Discount Amount",
    override_price: "Override Price",
    free_item: "Action Value",
    cashback: "Cashback Amount",
    bundle_price: "Action Value",
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="promotion-action-value">{inputLabelMap[actionType] || "Action Value"}</Label>
      <Input
        id="promotion-action-value"
        type="number"
        min="0"
        step="0.01"
        value={primaryValue}
        placeholder="Input action value"
        onChange={(event) => onChange({ value: toNumberOrEmpty(event.target.value) })}
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
