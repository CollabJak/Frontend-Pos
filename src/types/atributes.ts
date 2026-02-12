import z from "zod";
import { AtributeSchema } from "../Schemas/atributeSchema";

export interface Atribute {
  id: number;
  name: string;
}

export type CreateAtributePayload = z.infer<typeof AtributeSchema>;