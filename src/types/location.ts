import { z } from "zod";
import { locationSchema } from "../Schemas/locationSchema";

export type LocationType = "store" | "warehouse" | "pos" | "hq";

export interface Location {
  id: number;
  name: string;
  type: LocationType;
  parent_id: number | null;
  parent?: {
    id: number;
    name: string;
    type: LocationType;
  } | null;
  children?: Array<{
    id: number;
    name: string;
    type: LocationType;
    parent_id: number | null;
  }>;
  is_primary?: boolean;
  is_active_pivot?: boolean;
}

export type LocationFormData = z.infer<typeof locationSchema>;
