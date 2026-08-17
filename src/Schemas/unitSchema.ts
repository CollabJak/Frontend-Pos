import { z } from "zod";

export const roundingModeValues = ["HALF_UP", "HALF_DOWN", "HALF_EVEN", "UP", "DOWN"] as const;

export const unitSchema = z.object({
  name: z
    .string()
    .min(1, "Nama satuan wajib diisi")
    .max(255, "Nama satuan maksimal 255 karakter"),
  symbol: z
    .string()
    .min(1, "Simbol satuan wajib diisi")
    .max(50, "Simbol satuan maksimal 50 karakter"),
  description: z.string().optional().or(z.literal("")),
  is_base_unit: z.boolean().optional().default(false),
  precision: z
    .number()
    .int("Presisi harus berupa bilangan bulat")
    .refine((value) => [0, 2, 4].includes(value), {
      message: "Presisi harus salah satu dari: 0, 2, 4",
    })
    .optional()
    .default(0),
  rounding_mode: z.enum(roundingModeValues).optional().default("HALF_UP"),
});

export type UnitFormData = z.input<typeof unitSchema>;
