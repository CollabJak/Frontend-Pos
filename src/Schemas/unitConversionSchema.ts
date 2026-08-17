import {z} from "zod";

export const unitConversionRoundingModes = ["up", "down", "nearest"] as const;

export const unitConversionSchema = z.object({
  product_variant_id: z.number().int().min(1, "Varian produk wajib dipilih"),
  from_unit_id: z.number().min(1, "Satuan asal wajib dipilih").max(255, "Satuan asal tidak valid"),
  to_unit_id: z.number().min(1, "Satuan tujuan wajib dipilih").max(255, "Satuan tujuan tidak valid"),
  multiplier: z.number().positive("Pengali konversi harus berupa angka positif"),
  precision: z.number().int("Presisi harus berupa bilangan bulat").min(0, "Presisi minimal 0").optional().default(0),
  rounding_mode: z.enum(unitConversionRoundingModes).optional().default("nearest"),
  is_purchase_conversion: z.boolean().optional().default(true),
  is_sales_conversion: z.boolean().optional().default(true),
}).refine((data) => data.from_unit_id !== data.to_unit_id, {
  message: "Satuan asal dan satuan tujuan harus berbeda",
  path: ["from_unit_id"],
});

export type UnitConversionFormData = z.input<typeof unitConversionSchema>;
