import {z} from "zod";
import { productSchema } from "../Schemas/productSchema";

export type ProductStatus = "active" | "inactive" | "discontinued";

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  category_id: number;
  brand_id: number;
  unit_id: number;
  description?: string | null;
  thumbnail?: string | null;
  status: ProductStatus;
  is_sellable: boolean;
  is_purchasable: boolean;
  has_variant: boolean;
  category?: {
    id: number;
    name: string;
  } | null;
  brand?: {
    id: number;
    name: string;
  } | null;
  unit?: {
    id: number;
    name: string;
  } | null;
}

export type ProductFormData = z.infer<typeof productSchema>;
