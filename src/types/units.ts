import { z } from "zod";
import { unitSchema } from "../Schemas/unitSchema";

export interface Units {
  id: number;
  name: string;
  symbol: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateUnitPayload = z.infer<typeof unitSchema>;