import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Nama pemasok wajib diisi").max(255, "Nama pemasok maksimal 255 karakter"),
  contact_person: z.string().min(1, "Nama penanggung jawab wajib diisi").max(255, "Nama penanggung jawab maksimal 255 karakter"),
  phone: z.string().min(1, "Nomor telepon wajib diisi").max(50, "Nomor telepon maksimal 50 karakter"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid").max(255, "Email maksimal 255 karakter"),
  address: z.string().min(1, "Alamat pemasok wajib diisi"),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
