import { z } from "zod";

const requiredString = (message: string) => z.string().trim().min(1, message);

export const businessSchema = z.object({
  name: requiredString("Nama bisnis wajib diisi").max(255, "Nama bisnis terlalu panjang"),
  code: requiredString("Kode bisnis wajib diisi").max(255, "Kode bisnis terlalu panjang"),
  email: requiredString("Email bisnis wajib diisi").email("Format email bisnis tidak valid"),
  phone: requiredString("No. telepon wajib diisi").max(50, "No. telepon terlalu panjang"),
  address: requiredString("Alamat lengkap wajib diisi"),
  is_active: z.boolean(),
});

export const createBusinessSchema = z.object({
  name: requiredString("Nama bisnis wajib diisi").max(255, "Nama bisnis terlalu panjang"),
  code: requiredString("Kode bisnis wajib diisi").max(255, "Kode bisnis terlalu panjang"),
  email: requiredString("Email bisnis wajib diisi").email("Format email bisnis tidak valid"),
  phone: requiredString("No. telepon wajib diisi").max(50, "No. telepon terlalu panjang"),
  address: requiredString("Alamat lengkap wajib diisi"),
  is_active: z.boolean(),
});

export type BusinessFormData = z.infer<typeof businessSchema>;
export type CreateBusinessFormData = z.infer<typeof createBusinessSchema>;
