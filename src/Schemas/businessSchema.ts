import { z } from "zod";

const requiredString = (message: string) => z.string().trim().min(1, message);

export const businessSchema = z.object({
  name: z.string().min(1, "Business name is required").max(255, "Business name is too long"),
  code: z.string().min(1, "Business code is required").max(255, "Business code is too long"),
  email: z.string().min(1, "Business email is required").email("Business email is invalid"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  is_active: z.boolean(),
});

export const createBusinessSchema = z.object({
  name: requiredString("Business name is required").max(255, "Business name is too long"),
  code: requiredString("Business code is required").max(255, "Business code is too long"),
  email: requiredString("Business email is required").email("Business email is invalid"),
  phone: requiredString("Business phone is required").max(50, "Business phone is too long"),
  address: requiredString("Business address is required"),
  is_active: z.boolean(),
});

export type BusinessFormData = z.infer<typeof businessSchema>;
export type CreateBusinessFormData = z.infer<typeof createBusinessSchema>;
