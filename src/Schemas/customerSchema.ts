import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Nama pelanggan wajib diisi")
    .max(255, "Nama pelanggan maksimal 255 karakter"),
  phone: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .max(20, "Nomor telepon maksimal 20 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  customer_group_id: z
    .number({ message: "Grup pelanggan harus dipilih" })
    .nullable()
    .optional(),
  code: z
    .string()
    .max(50, "Kode member maksimal 50 karakter")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(1000, "Alamat maksimal 1000 karakter")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
