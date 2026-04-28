import { z } from "zod";
import { SubscriptionPlanSchema } from "../Schemas/subscriptionPlanSchema";

export interface SubscriptionPlan {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  billing_cycle: "monthly" | "yearly";
  is_popular: boolean;
  features: Record<string, string | number | boolean | null> | null;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionPlanFormData = z.infer<typeof SubscriptionPlanSchema>;
