import { z } from "zod";
import {
  promotionActionSchema,
  promotionActionTypeValues,
} from "../Schemas/promotionActionSchema";

export interface PromotionAction {
  id: number;
  promotion_id: number;
  promotion?: {
    id: number;
    code: string;
    name: string;
    type: string;
  } | null;
  action_type: (typeof promotionActionTypeValues)[number];
  action_value: Record<string, unknown>;
  action_value_display?: string;
}

export type PromotionActionFormData = z.infer<typeof promotionActionSchema>;
