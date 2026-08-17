import { z } from "zod";

export const promotionConditionTypeValues = [
  "customer_group",
  "min_qty",
  "location",
  "weekday",
  "channel",
  "total_transaction",
  "payment_method",
  "time_range",
] as const;

export const promotionConditionOperatorValues = [
  "=",
  ">",
  "<",
  ">=",
  "<=",
  "IN",
  "BETWEEN",
] as const;

export const promotionConditionSchema = z.object({
  promotion_id: z.number().int().min(1, "Promosi wajib dipilih"),
  condition_type: z.enum(promotionConditionTypeValues, {
    message: "Tipe syarat wajib dipilih",
  }),
  condition_operator: z.enum(promotionConditionOperatorValues, {
    message: "Operator syarat wajib dipilih",
  }),
  condition_value: z
    .record(z.string(), z.unknown())
    .refine((value) => Object.keys(value).length > 0, {
      message: "Nilai syarat wajib diisi",
    }),
});

export type PromotionConditionFormData = z.infer<typeof promotionConditionSchema>;
