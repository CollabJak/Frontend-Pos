import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(255, "Supplier name is too long"),
  contact_person: z.string().min(1, "Contact person is required").max(255, "Contact person name is too long"),
  phone: z.string().min(1, "Phone number is required").max(50, "Phone number is too long"),
  email: z.string().min(1, "Email is required").email("Invalid email address").max(255, "Email is too long"),
  address: z.string().min(1, "Address is required"),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
