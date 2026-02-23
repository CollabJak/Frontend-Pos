import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required").max(255, "Warehouse name is too long"),
  address: z.string().min(1, "Address is required"),
  photo: z
    .union([z.instanceof(File), z.string(), z.null()])
    .optional()
    .refine(
      (photo) =>
        photo === undefined ||
        photo === null ||
        typeof photo === "string" ||
        ["image/png", "image/jpeg", "image/jpg", "image/gif"].includes(photo.type),
      {
        message: "Invalid image format. Use PNG, JPEG, JPG, or GIF.",
      }
    )
    .refine(
      (photo) =>
        photo === undefined ||
        photo === null ||
        typeof photo === "string" ||
        photo.size <= 2 * 1024 * 1024,
      {
        message: "Image size must be under 2MB.",
      }
    ),
  phone: z.string().min(1, "Phone number is required").max(50, "Phone number is too long"),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;
