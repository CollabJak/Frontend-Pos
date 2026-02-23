import { z } from "zod";

export const promotionSchema = z
  .object({
    code: z
      .string()
      .min(1, "Promotion code is required")
      .max(255, "Promotion code is too long"),
    name: z
      .string()
      .min(1, "Promotion name is required")
      .max(255, "Promotion name is too long"),
    type: z
      .string()
      .min(1, "Promotion type is required")
      .max(255, "Promotion type is too long"),
    priority: z.number().int("Promotion priority must be an integer"),
    is_stackable: z.boolean(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(data.start_date);
    if (Number.isNaN(startDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date is invalid",
        path: ["start_date"],
      });
    }

    if (!data.end_date || data.end_date.trim() === "") {
      return;
    }

    const endDate = new Date(data.end_date);
    if (Number.isNaN(endDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is invalid",
        path: ["end_date"],
      });
      return;
    }

    if (endDate < startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after or equal to start date",
        path: ["end_date"],
      });
    }
  });

export type PromotionFormData = z.infer<typeof promotionSchema>;
