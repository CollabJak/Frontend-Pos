import { z } from "zod";
import { customerGroupSchema } from "../Schemas/customerGroupSchema";

export interface CustomerGroup {
  id: number;
  code: "REGULAR" | "MEMBER" | "VIP" | "RESELLER" | "B2B";
  name: string;
  description: string | null;
  discount_percent: number;
  is_default: boolean;
  is_active: boolean;
}

export type CreateCustomerGroupPayload = z.infer<typeof customerGroupSchema>;
