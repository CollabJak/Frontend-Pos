import { z } from "zod";

export const priceTierSchema = z
  .object({
    product_variant_id: z.number().int().min(1, "Product variant is required"),
    customer_group_id: z.number().int().min(1, "Customer group is required"),
    min_qty: z.number().min(0, "Minimum quantity must be at least 0"),
    price: z.number().min(0, "Price must be at least 0"),
    location_id: z.number().int().min(1, "Location is required"),
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

export type PriceTierFormData = z.infer<typeof priceTierSchema>;
