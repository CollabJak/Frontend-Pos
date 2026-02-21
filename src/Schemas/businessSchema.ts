import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(1, "Business name is required").max(255, "Business name is too long"),
  code: z.string().min(1, "Business code is required").max(255, "Business code is too long"),
  email: z.string().min(1, "Business email is required").email("Business email is invalid"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  is_active: z.boolean(),
});

export type BusinessFormData = z.infer<typeof businessSchema>;
