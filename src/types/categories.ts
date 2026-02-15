import { z } from "zod";
import { categorySchema } from "../Schemas/categorySchema";

export type CategoryPickingStrategy = "FIFO" | "FEFO";

export interface Categories {
  id: number;
  name: string;
  code?: string;
  tagline: string | null;
  photo: string | null;
  require_expiry: boolean;
  require_batch: boolean;
  default_picking_strategy: CategoryPickingStrategy;
  created_by: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateCategoryPayload = z.infer<typeof categorySchema>;
