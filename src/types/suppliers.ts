import z from "zod";
import { supplierSchema } from "../Schemas/supplierSchema";

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateSupplierPayload = z.infer<typeof supplierSchema>;