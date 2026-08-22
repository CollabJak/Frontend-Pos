import { z } from "zod";
import { productSchema, compositeProductSchema, compositeVariantSchema } from "../Schemas/productSchema";
import { ProductVariant } from "./productVariant";

export type ProductStatus = "active" | "inactive" | "discontinued";

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  category_id: number;
  brand_id: number;
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
  variants?: ProductVariant[];
}

export type ProductFormData = z.infer<typeof productSchema>;
export type CompositeVariantFormData = z.infer<typeof compositeVariantSchema>;
export type CompositeProductFormData = z.infer<typeof compositeProductSchema>;
