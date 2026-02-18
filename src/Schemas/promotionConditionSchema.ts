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
  promotion_id: z.number().int().min(1, "Promotion is required"),
  condition_type: z.enum(promotionConditionTypeValues, {
    message: "Condition type is required",
  }),
  condition_operator: z.enum(promotionConditionOperatorValues, {
    message: "Condition operator is required",
  }),
  condition_value: z
    .record(z.string(), z.unknown())
    .refine((value) => Object.keys(value).length > 0, {
      message: "Condition value is required",
    }),
});

export type PromotionConditionFormData = z.infer<typeof promotionConditionSchema>;
