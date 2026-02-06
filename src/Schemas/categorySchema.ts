import { z } from "zod"; 

export const categorySchema = z.object({
    name: z.string().min(1, "Name is required"), 
    tagline: z.string().nullable().optional(), 
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
        file.size <= 2 * 1024 * 1024,
      {
        message: "Image size must be under 2MB.",
      }
    ),
  });

export type CategoryFormData = z.infer<typeof categorySchema>;
