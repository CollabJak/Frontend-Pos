import { z } from "zod"; 

export const categoryPickingStrategies = ["FIFO", "FEFO"] as const;

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  tagline: z.string().nullable().optional(),
  require_expiry: z.boolean().optional().default(false),
  require_batch: z.boolean().optional().default(false),
  default_picking_strategy: z.enum(categoryPickingStrategies).optional().default("FIFO"),
  photo: z
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

export type CategoryFormData = z.input<typeof categorySchema>;
