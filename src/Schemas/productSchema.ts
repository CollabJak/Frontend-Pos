import {z} from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  barcode: z.string().optional(),
  category_id: z.number().int().min(1, 'Category is required'),
  brand_id: z.number().int().min(1, 'Brand is required'),
  base_unit_id: z.number().int().min(1, 'Unit is required'),
  description: z.string().optional(),
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
        message: "Invalid image format. Use PNG, JPEG, or GIF.",
      }
    )
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        file.size <= 200 * 1024,
      {
        message: "Image size must be under 200KB.",
      }
    ),
});

export type ProductFormData = z.infer<typeof productSchema>;