import { z } from "zod";

export const posCheckoutItemSchema = z.object({
  variant_id: z.number().int("Variant is invalid").positive("Variant is required"),
  qty: z.number().int("Qty must be integer").min(1, "Qty must be at least 1"),
});

export const posCheckoutSchema = z.object({
  location_id: z.number().int("Location is invalid").positive("Location is required"),
  items: z.array(posCheckoutItemSchema).min(1, "Cart is empty"),
  payment: z.object({
    method: z.enum(["cash", "card", "qris", "split", "wallet"]),
    amount_paid: z.coerce.number().positive("Paid amount must be greater than zero"),
  }),
  device_id: z.string().trim().min(1).optional(),
});

export type PosCheckoutFormValues = z.infer<typeof posCheckoutSchema>;

export const openPosShiftSchema = z.object({
  location_id: z.number().int("Location is invalid").positive("Location is required"),
  starting_cash: z.number().min(0, "Starting cash must be at least 0"),
  notes: z.string().trim().nullable().optional(),
});
export type OpenPosShiftFormValues = z.infer<typeof openPosShiftSchema>;

export const addCashMovementSchema = z.object({
  pos_shift_id: z.number().int("Shift is invalid").positive("Shift is required"),
  type: z.enum(["in", "out"]),
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().trim().min(3, "Description must be at least 3 characters").max(255),
});
export type AddCashMovementFormValues = z.infer<typeof addCashMovementSchema>;

export const closePosShiftSchema = z.object({
  actual_cash: z.number().min(0, "Actual cash must be at least 0"),
  notes: z.string().trim().nullable().optional(),
});
export type ClosePosShiftFormValues = z.infer<typeof closePosShiftSchema>;
