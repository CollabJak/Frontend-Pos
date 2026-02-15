import { z } from "zod";

export const productVariantAttributeSchema = z.object({
  atribute_id: z.number().int().min(1, "Atribute is required"),
  value: z.string().min(1, "Atribute value is required"),
});

const nonNegativeNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return Number(value);
  },
  z.number().min(0, "Must be greater than or equal to 0")
);

export const productVariantSchema = z.object({
  product_id: z.number().int().min(1, "Product is required"),
  name: z.string().min(1, "Variant name is required"),
  barcode: z.string().trim().max(255, "Barcode is too long").optional(),
  attributes_json: z
    .array(productVariantAttributeSchema)
    .min(1, "At least one atribute is required"),
  is_stock_item: z.boolean().default(true),
  picking_strategy: z.enum(["FIFO", "FEFO"]),
  track_batch: z.boolean().default(false),
  track_expiry: z.boolean().default(false),
  costing_method: z.enum(["FIFO", "AVERAGE"]),
  base_unit_id: z.number().int().min(1, "Base unit is required"),
  purchase_unit_id: z.number().int().min(1, "Purchase unit is required"),
  sales_unit_id: z.number().int().min(1, "Sales unit is required"),
  allow_negative_stock: z.boolean().default(false),
  min_stock: nonNegativeNumber.optional(),
  reorder_point: nonNegativeNumber.optional(),
  internal_code: z.string().trim().max(255, "Internal code is too long").optional(),
  is_active: z.boolean().default(true),
});

export type ProductVariantFormData = z.input<typeof productVariantSchema>;
