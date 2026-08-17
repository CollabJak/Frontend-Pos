import { z } from "zod";

export const productVariantAttributeSchema = z.object({
  atribute_id: z.number().int().min(1, "Atribut wajib dipilih"),
  value: z.string().min(1, "Nilai atribut wajib diisi"),
});

const nonNegativeNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return Number(value);
  },
  z.number().min(0, "Harus lebih besar atau sama dengan 0")
);

export const productVariantSchema = z.object({
  product_id: z.number().int().min(1, "Produk utama wajib dipilih"),
  name: z.string().min(1, "Nama varian wajib diisi"),
  barcode: z.string().trim().max(255, "Barcode maksimal 255 karakter").optional(),
  attributes_json: z
    .array(productVariantAttributeSchema)
    .min(1, "Minimal satu atribut harus diisi"),
  is_stock_item: z.boolean().default(true),
  picking_strategy: z.enum(["FIFO", "FEFO"]).optional().default("FIFO"),
  track_batch: z.boolean().default(false),
  track_expiry: z.boolean().default(false),
  costing_method: z.enum(["FIFO", "AVERAGE"]).optional().default("AVERAGE"),
  base_unit_id: z.number().int().min(1, "Satuan dasar wajib dipilih"),
  purchase_unit_id: z.number().int().optional(),
  sales_unit_id: z.number().int().optional(),
  allow_negative_stock: z.boolean().default(false),
  min_stock: nonNegativeNumber.optional(),
  reorder_point: nonNegativeNumber.optional(),
  internal_code: z.string().trim().max(255, "Kode internal maksimal 255 karakter").optional(),
  is_active: z.boolean().default(true),
});

export type ProductVariantFormData = z.input<typeof productVariantSchema>;
