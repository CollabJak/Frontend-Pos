import { z } from "zod";

export const posCheckoutItemSchema = z.object({
  variant_id: z.number().int("Variant is invalid").positive("Variant is required"),
  qty: z.number().int("Qty must be integer").min(1, "Qty must be at least 1"),
});

export const posCheckoutSchema = z.object({
  location_id: z.number().int("Location is invalid").positive("Location is required"),
  items: z.array(posCheckoutItemSchema).min(1, "Cart is empty"),
  payment: z.object({
    method: z.enum(["cash", "card", "qris"]),
    amount_paid: z.coerce.number().positive("Paid amount must be greater than zero"),
  }),
  device_id: z.string().trim().min(1).optional(),
});

export type PosCheckoutFormValues = z.infer<typeof posCheckoutSchema>;
