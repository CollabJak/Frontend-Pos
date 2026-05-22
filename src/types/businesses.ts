import { z } from "zod";
import { businessSchema, createBusinessSchema } from "../Schemas/businessSchema";

export interface Business {
  id: number;
  name: string;
  code: string;
  email: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
}

export type CreateBusinessPayload = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessPayload = z.infer<typeof businessSchema>;
