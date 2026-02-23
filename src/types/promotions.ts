import { z } from "zod";
import { promotionSchema } from "../Schemas/promotionSchema";

export interface Promotion {
  id: number;
  code: string;
  name: string;
  type: string;
  priority: number;
  is_stackable: boolean;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
}

export type CreatePromotionPayload = z.infer<typeof promotionSchema>;
