import { z } from "zod"; 

export const categoryPickingStrategies = ["FIFO", "FEFO"] as const;

export const categorySchema = z.object({
    name: z.string().min(1, "Name is required"), 
    tagline: z.string().nullable().optional(), 
    require_expiry: z.boolean(),
    require_batch: z.boolean(),
    default_picking_strategy: z.enum(categoryPickingStrategies, {
      message: "Default picking strategy is required",
    }),
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

export type CategoryFormData = z.infer<typeof categorySchema>;
