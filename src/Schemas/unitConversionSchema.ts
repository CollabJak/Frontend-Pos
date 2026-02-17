import {z} from "zod";

export const unitConversionRoundingModes = ["up", "down", "nearest"] as const;

export const unitConversionSchema = z.object({
  product_variant_id: z.number().int().min(1, "Product variant is required"),
  from_unit_id: z.number().min(1, "From unit is required").max(255, "From unit is too long"),
  to_unit_id: z.number().min(1, "To unit is required").max(255, "To unit is too long"),
  multiplier: z.number().positive("Conversion multiplier must be a positive number"),
  precision: z.number().int("Precision must be an integer").min(0, "Precision must be at least 0"),
  rounding_mode: z.enum(unitConversionRoundingModes, {
    message: "Rounding mode is required",
  }),
  is_purchase_conversion: z.boolean(),
  is_sales_conversion: z.boolean(),
}).refine((data) => data.is_purchase_conversion || data.is_sales_conversion, {
  message: "At least one conversion type must be enabled",
  path: ["is_purchase_conversion"],
}).refine((data) => data.from_unit_id !== data.to_unit_id, {
  message: "From Unit and To Unit must be different",
  path: ["from_unit_id"],
});

export type UnitConversionFormData = z.infer<typeof unitConversionSchema>;
