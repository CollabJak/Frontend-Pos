import { z } from "zod";

export const promotionProductSchema = z.object({
  promotion_id: z.number().int().min(1, "Promosi wajib dipilih"),
  product_variant_id: z.number().int().min(1, "Varian produk wajib dipilih"),
});

export type PromotionProductFormData = z.infer<typeof promotionProductSchema>;
