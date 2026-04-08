import { z } from "zod";
import { subscriptionPlanSchema } from "../Schemas/subscriptionPlanSchema";

export interface SubscriptionPlan {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;
