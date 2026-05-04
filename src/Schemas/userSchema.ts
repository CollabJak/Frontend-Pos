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
