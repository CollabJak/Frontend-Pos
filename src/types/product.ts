import {z} from "zod";
import { productSchema } from "../Schemas/productSchema";

export interface Product {
  id: number;
  name: string;
  barcode?: string;
  category_id?: number;
  brand_id?: number;
  base_unit_id?: number;
  description?: string;
  thumbnail?: string;
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
