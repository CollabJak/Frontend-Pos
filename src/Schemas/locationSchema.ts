import { z } from "zod";

export const locationSchema = z.object({
  name: z
    .string()
    .min(1, "Nama lokasi wajib diisi")
    .max(255, "Nama lokasi maksimal 255 karakter"),
  type: z.enum(["store", "warehouse", "pos", "hq"], {
    message: "Tipe lokasi wajib dipilih",
  }),
  parent_id: z
    .number()
    .int("Lokasi induk tidak valid")
    .positive("Lokasi induk tidak valid")
    .nullable()
    .optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;
