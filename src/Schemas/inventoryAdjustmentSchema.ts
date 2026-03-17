import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
  product_variant_id: z.coerce
    .number()
    .int("Product variant is invalid")
    .positive("Product variant is required"),
  location_id: z.coerce
    .number()
    .int("Location is invalid")
    .positive("Location is required"),
  qty: z.coerce.number().positive("Qty must be greater than zero"),
  cost: z.coerce.number().positive("Cost must be greater than zero"),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(500, "Reason must not exceed 500 characters"),
});

export type InventoryAdjustmentFormData = z.infer<typeof inventoryAdjustmentSchema>;
