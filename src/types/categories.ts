import { z } from "zod";
import { categorySchema } from "../Schemas/categorySchema";

export interface Categories {
  id: number;
  name: string;
  code?: string;
  tagline: string;
  photo: string;
}

export type CreateCategoryPayload = z.infer<typeof categorySchema>;
