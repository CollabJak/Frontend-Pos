import { z } from "zod";

const optionalPositiveNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return value;
  },
  z.coerce.number().positive("Cost must be greater than zero").optional()
);

export const stockAdjustmentSchema = z.object({
  variant_id: z.coerce
    .number()
    .int("Product variant is invalid")
    .positive("Product variant is required"),
  location_id: z.coerce.number().int("Location is invalid").positive("Location is required"),
  qty: z.coerce.number().refine((value) => Number.isFinite(value) && value !== 0, {
    message: "Adjustment quantity must be a non-zero number.",
  }),
  cost: optionalPositiveNumber,
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(500, "Reason must not exceed 500 characters"),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;
