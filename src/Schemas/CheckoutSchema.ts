import * as z from "zod";

export const CheckoutSchema = z.object({
  business_name: z.string().min(1, "Nama bisnis wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  payment_method_id: z.coerce.number().min(1, "Pilih metode pembayaran"),
  payment_method_type: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof CheckoutSchema>;
