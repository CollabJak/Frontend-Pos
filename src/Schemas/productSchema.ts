import {z} from "zod";

export const productStatuses = ["active", "inactive", "discontinued"] as const;

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  barcode: z.string().optional(),
  category_id: z.number().int().min(1, "Kategori wajib dipilih"),
  brand_id: z.number().int().min(1, "Merek wajib dipilih"),
  unit_id: z.number().int().min(1, "Satuan wajib dipilih"),
  description: z.string().optional(),
  status: z.enum(productStatuses).optional().default("active"),
  is_sellable: z.boolean().optional().default(true),
  is_purchasable: z.boolean().optional().default(true),
  has_variant: z.boolean().optional().default(false),
  thumbnail: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        ["image/png", "image/jpeg", "image/gif"].includes(file.type),
      {
        message: "Format gambar tidak valid. Gunakan PNG, JPEG, atau GIF.",
      }
    )
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        file.size <= 200 * 1024,
      {
        message: "Ukuran gambar maksimal 200KB.",
      }
    ),
});

export type ProductFormData = z.input<typeof productSchema>;
