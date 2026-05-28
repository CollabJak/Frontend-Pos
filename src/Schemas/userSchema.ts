import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  photo: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        ["image/png", "image/jpeg"].includes(file.type),
      {
        message: "Invalid image format. Use PNG or JPEG.",
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
  business_id: z.number().optional().nullable(),
});

export type UserFormData = z.infer<typeof userSchema>;

export const syncUserLocationsSchema = z.object({
  location_ids: z.array(z.number()).min(1, "Please select at least one location."),
  primary_location_id: z.number().nullable().refine((val) => val !== null && val !== undefined, "Please select a primary location."),
}).refine((data) => data.primary_location_id !== null && data.location_ids.includes(data.primary_location_id!), {
  message: "Primary location must be one of the selected locations.",
  path: ["primary_location_id"],
});

export type SyncUserLocationsFormData = z.infer<typeof syncUserLocationsSchema>;

