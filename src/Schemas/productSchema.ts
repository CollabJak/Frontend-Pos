import {z} from "zod";

export const productStatuses = ["active", "inactive", "discontinued"] as const;

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  barcode: z.string().optional(),
  category_id: z.number().int().min(1, 'Category is required'),
  brand_id: z.number().int().min(1, 'Brand is required'),
  unit_id: z.number().int().min(1, 'Unit is required'),
  description: z.string().optional(),
  status: z.enum(productStatuses),
  is_sellable: z.boolean(),
  is_purchasable: z.boolean(),
  has_variant: z.boolean(),
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
