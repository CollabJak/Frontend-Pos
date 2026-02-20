import { z } from "zod";

export const promotionProductSchema = z.object({
  promotion_id: z.number().int().min(1, "Promotion is required"),
  product_variant_id: z.number().int().min(1, "Product variant is required"),
});

export type PromotionProductFormData = z.infer<typeof promotionProductSchema>;
