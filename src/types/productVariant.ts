import { z } from "zod";
import { productVariantSchema } from "../Schemas/productVariantSchema";

export interface ProductVariantAtribute {
  atribute_id: number;
  name?: string | null;
  value: string;
}

export type PickingStrategy = "FIFO" | "FEFO";
export type CostingMethod = "FIFO" | "AVERAGE";

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  barcode?: string | null;
  name: string;
  attributes_json: ProductVariantAtribute[];
  is_stock_item: boolean;
  picking_strategy: PickingStrategy;
  track_batch: boolean;
  track_expiry: boolean;
  costing_method: CostingMethod;
  base_unit_id: number;
  purchase_unit_id: number;
  sales_unit_id: number;
  allow_negative_stock: boolean;
  min_stock?: number | null;
  reorder_point?: number | null;
  internal_code?: string | null;
  is_active: boolean;
  product?: {
    id: number;
    name: string;
    sku: string;
  } | null;
  base_unit?: {
    id: number;
    name: string;
    symbol?: string | null;
  } | null;
  purchase_unit?: {
    id: number;
    name: string;
    symbol?: string | null;
  } | null;
  sales_unit?: {
    id: number;
    name: string;
    symbol?: string | null;
  } | null;
}

export type ProductVariantFormData = z.input<typeof productVariantSchema>;
