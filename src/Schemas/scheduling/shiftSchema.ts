import { z } from "zod";

export const shiftBreakTimeSchema = z.object({
  name: z.string().nullable().optional(),
  break_start: z.string().min(1, "Jam mulai istirahat wajib diisi"),
  break_end: z.string().min(1, "Jam selesai istirahat wajib diisi"),
});

export const shiftSchema = z.object({
  name: z.string().min(1, "Nama shift wajib diisi"),
  color: z.string().min(1, "Warna shift wajib diisi"),
  check_in_time: z.string().min(1, "Jam masuk wajib diisi"),
  check_out_time: z.string().min(1, "Jam keluar wajib diisi"),
  is_cross_day: z.boolean(),
  tolerance_late_minutes: z.number().min(0),
  tolerance_early_out_minutes: z.number().min(0),
  auto_checkout: z.boolean(),
  auto_checkout_offset_minutes: z.number().min(0),
  is_active: z.boolean(),
  description: z.string().nullable().optional(),
  break_times: z.array(shiftBreakTimeSchema),
});

export type ShiftFormValues = z.infer<typeof shiftSchema>;
