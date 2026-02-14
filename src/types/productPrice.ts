import { z } from "zod";
import { productPriceSchema } from "../Schemas/productPriceSchema";

export type ProductPriceType = "sell" | "purchase" | "wholesale" | "cost" | "member";

export interface ProductPrice {
  id: number;
  product_variant_id: number;
  product_variant?: {
    id: number;
    name: string;
    sku: string;
  } | null;
  location_id: number;
  location?: {
    id: number;
    name: string;
    type: string;
  } | null;
  price: string;
  price_type: ProductPriceType;
  start_date: string;
  end_date?: string | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
}

export type ProductPriceFormData = z.infer<typeof productPriceSchema>;
