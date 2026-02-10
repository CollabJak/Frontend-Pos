import {z} from "zod";

export const unitConversionSchema = z.object({
  product_id: z.number().min(1, "Product ID is required").max(255, "Product ID is too long"),
  from_unit_id: z.number().min(1, "From unit is required").max(255, "From unit is too long"),
  to_unit_id: z.number().min(1, "To unit is required").max(255, "To unit is too long"),
  multiplier: z.number().positive("Conversion multiplier must be a positive number"),
});

export type UnitConversionFormData = z.infer<typeof unitConversionSchema>;