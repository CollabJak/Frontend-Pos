import { z } from "zod";

export const bulkGenerateSchema = z.object({
  batch_name: z.string().min(1, "Nama batch wajib diisi"),
  user_ids: z.array(z.number()).min(1, "Pilih setidaknya satu karyawan"),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().min(1, "Tanggal selesai wajib diisi"),
  shift_id: z.number({ message: "Pilih shift" }),
  skip_holidays: z.boolean(),
  location_id: z.number().nullable().optional(),
  force: z.boolean(),
});

export type BulkGenerateValues = z.infer<typeof bulkGenerateSchema>;

export const rotationGenerateSchema = z.object({
  batch_name: z.string().min(1, "Nama batch wajib diisi"),
  user_ids: z.array(z.number()).min(1, "Pilih setidaknya satu karyawan"),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().min(1, "Tanggal selesai wajib diisi"),
  rotation_pattern_id: z.number({ message: "Pilih pola rotasi" }),
  start_day_index: z.number().min(0),
  skip_holidays: z.boolean(),
  location_id: z.number().nullable().optional(),
  force: z.boolean(),
});

export type RotationGenerateValues = z.infer<typeof rotationGenerateSchema>;
