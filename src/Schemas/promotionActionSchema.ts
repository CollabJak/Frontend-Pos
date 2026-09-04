import { z } from "zod";

/**
 * Katalog benefit final (FR-1 BRD v1.4) — sinkron dengan
 * PromotionAction::ACTION_TYPES di backend:
 * discount_percent, discount_amount, cashback.
 */
export const promotionActionTypeValues = [
  "discount_percent",
  "discount_amount",
  "cashback",
] as const;

export type PromotionActionType = (typeof promotionActionTypeValues)[number];

export const promotionActionTypeLabels: Record<PromotionActionType, string> = {
  discount_percent: "Diskon Persentase",
  discount_amount: "Diskon Nominal",
  cashback: "Cashback",
};

export const promotionActionSchema = z
  .object({
    promotion_id: z.number().int().min(1, "Promosi wajib dipilih"),
    action_type: z.enum(promotionActionTypeValues, {
      message: "Tipe aksi wajib dipilih",
    }),
    action_value: z.record(z.string(), z.unknown()),
  })
  .superRefine((data, ctx) => {
    const { action_type, action_value } = data;

    if (!action_value || typeof action_value !== "object") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nilai aksi wajib diisi",
        path: ["action_value"],
      });
      return;
    }

    if (action_type === "discount_percent") {
      const val = action_value.value ?? action_value.percent;
      if (val === "" || val === null || val === undefined || Number.isNaN(Number(val))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Persentase diskon wajib diisi",
          path: ["action_value", "value"],
        });
      } else {
        const num = Number(val);
        if (num <= 0 || num > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Persentase diskon harus di antara 0.01% dan 100%",
            path: ["action_value", "value"],
          });
        }
      }
    } else if (action_type === "discount_amount") {
      const val = action_value.value ?? action_value.amount;
      if (val === "" || val === null || val === undefined || Number.isNaN(Number(val))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah diskon wajib diisi",
          path: ["action_value", "value"],
        });
      } else if (Number(val) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah diskon harus lebih dari 0",
          path: ["action_value", "value"],
        });
      }
    } else if (action_type === "cashback") {
      const val = action_value.value ?? action_value.amount;
      if (val === "" || val === null || val === undefined || Number.isNaN(Number(val))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah cashback wajib diisi",
          path: ["action_value", "value"],
        });
      } else if (Number(val) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah cashback harus lebih dari 0",
          path: ["action_value", "value"],
        });
      }
    }
  });

export type PromotionActionFormData = z.infer<typeof promotionActionSchema>;
