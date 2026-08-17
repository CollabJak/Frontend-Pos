import { z } from "zod";

export const promotionActionTypeValues = [
  "discount_percent",
  "discount_amount",
  "override_price",
  "free_item",
  "cashback",
  "bundle_price",
] as const;

export const promotionActionSchema = z.object({
  promotion_id: z.number().int().min(1, "Promosi wajib dipilih"),
  action_type: z.enum(promotionActionTypeValues, {
    message: "Tipe aksi wajib dipilih",
  }),
  action_value: z
    .record(z.string(), z.unknown())
    .refine((value) => Object.keys(value).length > 0, {
      message: "Nilai aksi wajib diisi",
    }),
});

export type PromotionActionFormData = z.infer<typeof promotionActionSchema>;
