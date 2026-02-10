import {z} from "zod"
import { unitConversionSchema } from "../Schemas/unitConversionSchema"

export interface UnitConversions {
  id: number;
  product_id: number;
  product: string;
  from_unit_id : number;
  from_unit : string;
  to_unit_id : number;
  to_unit: string;
  multiplier: number;
}

export type UnitConversionFormData = z.infer<typeof unitConversionSchema>