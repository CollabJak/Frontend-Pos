import { z } from "zod";
import { BrandSchema } from "../Schemas/brandSchema";

export interface Brand {
  id: number;
  name: string;
  description?: string;
}

export type CreateBrandPayload = z.infer<typeof BrandSchema>;
