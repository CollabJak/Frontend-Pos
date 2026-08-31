import { z } from "zod";

export const productStatuses = ["active", "inactive", "discontinued"] as const;

export const compositeAttributeSchema = z.object({
  atribute_id: z.number().min(1, "Atribut wajib dipilih"),
  atribute_name: z.string().optional().nullable(),
  value: z.string().min(1, "Nilai atribut wajib diisi"),
});

export const compositeVariantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Nama varian wajib diisi"),
  barcode: z.string().optional().nullable(),
  base_unit_id: z.number().min(1, "Satuan wajib dipilih"),
  unit_name: z.string().optional().nullable(),
  location_id: z.number().optional().nullable(),
  location_name: z.string().optional().nullable(),
  location_ids: z.array(z.number()).optional().default([]),
  location_types: z.array(z.enum(["store", "warehouse", "pos", "hq"])).optional().default([]),
  purchase_unit_id: z.number().optional().nullable(),
  sales_unit_id: z.number().optional().nullable(),
  selling_price: z.number().min(1, "Harga jual wajib lebih dari 0"),
  cost_price: z.number().min(0, "Harga modal minimal 0").optional().nullable(),
  attributes_json: z.array(compositeAttributeSchema).default([]),
});

export const compositeProductSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  barcode: z.string().optional().nullable(),
  category_id: z.number().min(1, "Kategori wajib dipilih"),
  brand_id: z.number().min(1, "Merek wajib dipilih"),
  description: z.string().optional().nullable(),
  status: z.enum(productStatuses).default("active"),
  is_sellable: z.boolean().default(true),
  is_purchasable: z.boolean().default(true),
  has_variant: z.boolean().default(false),
  thumbnail: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type),
      {
        message: "Format gambar tidak valid. Gunakan PNG, JPEG, JPG, atau WEBP.",
      }
    )
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        file.size <= 2 * 1024 * 1024,
      {
        message: "Ukuran gambar maksimal 2MB.",
      }
    ),
  variants: z.array(compositeVariantSchema).min(1, "Minimal harus ada 1 varian produk"),
});

export const productSchema = compositeProductSchema;
export type ProductFormData = z.infer<typeof compositeProductSchema>;
