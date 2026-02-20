import { z } from "zod";
import { promotionProductSchema } from "../Schemas/promotionProductSchema";

export interface PromotionProduct {
  id: number;
  promotion_id: number;
  promotion?: {
    id: number;
    code: string;
    name: string;
    type: string;
  } | null;
  product_variant_id: number;
  product_variant?: {
    id: number;
    name: string;
    sku: string;
  } | null;
}

export type PromotionProductFormData = z.infer<typeof promotionProductSchema>;
