import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required").max(255, "Warehouse name is too long"),
  address: z.string().min(1, "Address is required"),
  photo: z.union([
    z.string().url("Invalid URL").max(255, "Photo URL is too long"),
    z.literal("")
  ]).optional(),
  phone: z.string().min(1, "Phone number is required").max(50, "Phone number is too long"),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;
