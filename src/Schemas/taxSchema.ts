import { z } from "zod";

export const taxSchema = z.object({
  name: z
    .string()
    .min(1, "Nama pajak wajib diisi")
    .max(100, "Nama pajak maksimal 100 karakter"),
  code: z
    .string()
    .max(20, "Kode maksimal 20 karakter")
    .optional()
    .or(z.literal("")),
  rate: z
    .number({ message: "Tarif pajak harus berupa angka" })
    .min(0, "Tarif pajak minimal 0%")
    .max(100, "Tarif pajak maksimal 100%"),
  type: z.enum(["percentage", "fixed"]),
  is_active: z.boolean(),
  is_default: z.boolean(),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
});

export type TaxFormValues = z.infer<typeof taxSchema>;
