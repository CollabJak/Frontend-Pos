import z from "zod";
import { warehouseSchema } from "../Schemas/warehouseSchema";

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  photo?: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export type CreateWarehousePayload = z.infer<typeof warehouseSchema>;