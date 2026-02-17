import { z } from "zod";
import { priceTierSchema } from "../Schemas/priceTierSchema";

export interface PriceTier {
  id: number;
  product_variant_id: number;
  product_variant?: {
    id: number;
    name: string;
    sku: string;
  } | null;
  customer_group_id: number;
  customer_group?: {
    id: number;
    code: string;
    name: string;
  } | null;
  min_qty: number;
  price: number;
  location_id: number;
  location?: {
    id: number;
    name: string;
    type: string;
  } | null;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
}

export type PriceTierFormData = z.infer<typeof priceTierSchema>;
