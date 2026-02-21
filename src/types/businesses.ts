import { z } from "zod";
import { businessSchema } from "../Schemas/businessSchema";

export interface Business {
  id: number;
  name: string;
  code: string;
  email: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
}

export type CreateBusinessPayload = z.infer<typeof businessSchema>;
