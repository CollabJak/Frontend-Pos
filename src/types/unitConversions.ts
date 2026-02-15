import {z} from "zod"
import { unitConversionSchema } from "../Schemas/unitConversionSchema"

export type UnitConversionRoundingMode = "up" | "down" | "nearest";

export interface UnitConversions {
  id: number;
  product_variant_id: number;
  product_variant: string | null;
  from_unit_id : number;
  from_unit : string | null;
  to_unit_id : number;
  to_unit: string | null;
  multiplier: number;
  precision: number;
  rounding_mode: UnitConversionRoundingMode;
  is_purchase_conversion: boolean;
  is_sales_conversion: boolean;
}

export type UnitConversionFormData = z.infer<typeof unitConversionSchema>
