import { z } from "zod";
import { customerSchema } from "../Schemas/customerSchema";

export interface CustomerGroupSummary {
  id: number;
  code: "REGULAR" | "MEMBER" | "VIP" | "RESELLER" | "B2B";
  name: string;
  discount_percent: number;
}

export interface Customer {
  id: number;
  business_id: number;
  customer_group_id: number | null;
  code: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  customer_group?: CustomerGroupSummary | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateCustomerPayload = z.infer<typeof customerSchema>;

export interface CustomerOption {
  id: number;
  name: string;
  phone: string | null;
  code: string | null;
  customer_group_id: number | null;
  customer_group?: CustomerGroupSummary | null;
}
