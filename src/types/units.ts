import { z } from "zod";
import { unitSchema } from "../Schemas/unitSchema";

export type RoundingMode = "HALF_UP" | "HALF_DOWN" | "HALF_EVEN" | "UP" | "DOWN";

export interface Units {
  id: number;
  name: string;
  symbol: string;
  description?: string;
  is_base_unit: boolean;
  precision: number;
  rounding_mode: RoundingMode;
}

export type CreateUnitPayload = z.infer<typeof unitSchema>;
