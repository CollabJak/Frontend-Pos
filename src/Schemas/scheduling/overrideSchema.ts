import { z } from "zod";

const reasonSchema = z.string().trim().min(10, "Alasan minimal 10 karakter.");

export const rescheduleOverrideSchema = z.object({
  schedule_id: z.number(),
  new_shift_id: z.number().nullable().optional(),
  new_schedule_date: z.string().nullable().optional(),
  reason: reasonSchema,
}).refine(
  (data) => !!data.new_shift_id || !!data.new_schedule_date,
  "Pilih shift baru atau tanggal baru."
);

export const emergencyOverrideSchema = z.object({
  schedule_id: z.number(),
  replacement_user_id: z.number({ message: "Pilih karyawan pengganti." }),
  reason: reasonSchema,
});

export const swapOverrideSchema = z.object({
  schedule_id_1: z.number(),
  schedule_id_2: z.number({ message: "Pilih jadwal target untuk ditukar." }),
  reason: reasonSchema,
});

export const overtimeOverrideSchema = z.object({
  user_id: z.number(),
  shift_id: z.number({ message: "Pilih shift lembur." }),
  schedule_date: z.string().min(1, "Tanggal lembur wajib diisi."),
  reason: reasonSchema,
});
