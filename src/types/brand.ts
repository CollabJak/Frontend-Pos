import { z } from "zod";
import { BrandSchema } from "../Schemas/brandSchema";

export interface Brand {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export type CreateBrandPayload = z.infer<typeof BrandSchema>;
