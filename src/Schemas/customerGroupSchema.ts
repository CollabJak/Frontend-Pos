import { z } from "zod";

export const customerGroupCodeValues = ["REGULAR", "MEMBER", "VIP", "RESELLER", "B2B"] as const;

export const customerGroupSchema = z.object({
  code: z.enum(customerGroupCodeValues, {
    message: "Customer group code is required",
  }),
  name: z.string().min(1, "Customer group name is required").max(255, "Customer group name is too long"),
  description: z.string().optional().or(z.literal("")),
  discount_percent: z
    .number()
    .min(0, "Discount percent must be at least 0")
    .max(100, "Discount percent must be at most 100"),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export type CustomerGroupFormData = z.infer<typeof customerGroupSchema>;
