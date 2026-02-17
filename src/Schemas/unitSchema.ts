import { z } from "zod";

export const roundingModeValues = ["HALF_UP", "HALF_DOWN", "HALF_EVEN", "UP", "DOWN"] as const;

export const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required").max(255, "Unit name is too long"),
  symbol: z.string().min(1, "Unit symbol is required").max(50, "Unit symbol is too long"),
  description: z.string().optional().or(z.literal("")),
  is_base_unit: z.boolean(),
  precision: z
    .number()
    .int("Precision must be an integer")
    .refine((value) => [0, 2, 4].includes(value), {
      message: "Precision must be one of: 0, 2, 4",
    }),
  rounding_mode: z.enum(roundingModeValues, {
    message: "Rounding mode is required",
  }),
});

export type UnitFormData = z.infer<typeof unitSchema>;
