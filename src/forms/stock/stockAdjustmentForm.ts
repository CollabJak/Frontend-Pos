import type { InventoryAdjustmentPayload } from "../../types/types";
import type { StockAdjustmentFormValues } from "../../Schemas/stock.schema";

export const toInventoryAdjustmentPayload = (
  values: StockAdjustmentFormValues
): InventoryAdjustmentPayload => ({
  product_variant_id: values.variant_id,
  location_id: values.location_id,
  qty: values.qty,
  reason: values.reason.trim(),
  ...(values.cost != null ? { cost: values.cost } : {}),
});
