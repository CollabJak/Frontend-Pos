import { z } from "zod";

export const customerGroupCodeValues = ["REGULAR", "MEMBER", "VIP", "RESELLER", "B2B"] as const;

export const customerGroupSchema = z.object({
  code: z.enum(customerGroupCodeValues, {
    message: "Kode grup pelanggan wajib dipilih",
  }),
  name: z
    .string()
    .min(1, "Nama grup pelanggan wajib diisi")
    .max(255, "Nama grup pelanggan maksimal 255 karakter"),
  description: z.string().optional().or(z.literal("")),
  discount_percent: z
    .number({ message: "Persentase diskon harus berupa angka" })
    .min(0, "Persentase diskon minimal 0%")
    .max(100, "Persentase diskon maksimal 100%"),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export type CustomerGroupFormData = z.infer<typeof customerGroupSchema>;
