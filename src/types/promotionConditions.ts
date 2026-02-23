import { z } from "zod";
import {
  promotionConditionOperatorValues,
  promotionConditionSchema,
  promotionConditionTypeValues,
} from "../Schemas/promotionConditionSchema";

export interface PromotionCondition {
  id: number;
  promotion_id: number;
  promotion?: {
    id: number;
    code: string;
    name: string;
    type: string;
  } | null;
  condition_type: (typeof promotionConditionTypeValues)[number];
  condition_operator: (typeof promotionConditionOperatorValues)[number];
  condition_value: unknown;
  condition_value_display?: string;
}

export type PromotionConditionFormData = z.infer<typeof promotionConditionSchema>;
