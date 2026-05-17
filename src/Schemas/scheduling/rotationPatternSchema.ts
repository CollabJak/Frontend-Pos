import { z } from "zod";

export const rotationPatternItemSchema = z.object({
  day_index: z.number().min(0),
  shift_id: z.number().nullable().optional(),
  is_day_off: z.boolean(),
}).refine((data) => {
  if (!data.is_day_off && !data.shift_id) {
    return false;
  }
  return true;
}, {
  message: "Shift harus dipilih jika bukan hari libur",
  path: ["shift_id"],
});

export const rotationPatternSchema = z.object({
  name: z.string().min(1, "Nama pola rotasi wajib diisi"),
  cycle_days: z.number().min(1).optional(), // Akan diisi otomatis saat submit
  description: z.string().nullable().optional(),
  items: z.array(rotationPatternItemSchema).min(1, "Minimal harus ada 1 item pola"),
});

export type RotationPatternFormValues = z.infer<typeof rotationPatternSchema>;
