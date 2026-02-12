import { z } from "zod";
import { productVariantSchema } from "../Schemas/productVariantSchema";

export interface ProductVariantAtribute {
  atribute_id: number;
  name?: string | null;
  value: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  barcode?: string | null;
  name: string;
  atribute: ProductVariantAtribute[];
  product?: {
    id: number;
    name: string;
    sku: string;
  } | null;
}

export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
