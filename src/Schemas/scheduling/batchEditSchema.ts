import { z } from "zod";

export const batchInfoSchema = z
  .object({
    name: z.string().min(1, "Nama batch wajib diisi").max(255, "Nama batch maksimal 255 karakter"),
    description: z.string().max(1000, "Deskripsi maksimal 1000 karakter").nullable().optional(),
    period_start: z.string().min(1, "Tanggal mulai wajib diisi"),
    period_end: z.string().min(1, "Tanggal selesai wajib diisi"),
  })
  .superRefine((val, ctx) => {
    if (val.period_start && val.period_end && val.period_end < val.period_start) {
      ctx.addIssue({
        code: "custom",
        path: ["period_end"],
        message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
      });
    }
  });

export type BatchInfoValues = z.infer<typeof batchInfoSchema>;

export const batchScheduleItemSchema = z
  .object({
    user_id: z.number({ message: "Pilih karyawan" }).int().positive(),
    shift_id: z.number().int().positive().nullable().optional(),
    schedule_date: z.string().min(1, "Tanggal wajib diisi"),
    is_day_off: z.boolean(),
    day_off_note: z.string().max(255, "Catatan maksimal 255 karakter").nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.is_day_off && val.shift_id) {
      ctx.addIssue({
        code: "custom",
        path: ["shift_id"],
        message: "Hari libur tidak boleh memiliki shift",
      });
    }
    if (!val.is_day_off && !val.shift_id) {
      ctx.addIssue({
        code: "custom",
        path: ["shift_id"],
        message: "Pilih shift untuk jadwal kerja",
      });
    }
  });

export type BatchScheduleItemValues = z.infer<typeof batchScheduleItemSchema>;

export const addBatchSchedulesSchema = z.object({
  schedules: z
    .array(batchScheduleItemSchema)
    .min(1, "Tambahkan minimal satu jadwal")
    .max(100, "Maksimal 100 jadwal per penambahan"),
});

export type AddBatchSchedulesValues = z.infer<typeof addBatchSchedulesSchema>;

export const bulkEditActionSchema = z.enum(["reassign_shift", "set_day_off", "remove"]);

export const bulkEditSchema = z
  .object({
    action: bulkEditActionSchema,
    filters: z.object({
      date_from: z.string().nullable().optional(),
      date_to: z.string().nullable().optional(),
      user_ids: z.array(z.number()).nullable().optional(),
      schedule_ids: z.array(z.number()).nullable().optional(),
      current_shift_id: z.number().nullable().optional(),
    }),
    payload: z
      .object({
        shift_id: z.number().int().positive().nullable().optional(),
        day_off_note: z.string().max(255).nullable().optional(),
      })
      .optional(),
  })
  .superRefine((val, ctx) => {
    const { date_from, date_to, user_ids, schedule_ids, current_shift_id } = val.filters;
    const hasFilter = Boolean(
      date_from || date_to || (user_ids && user_ids.length > 0) || (schedule_ids && schedule_ids.length > 0) || current_shift_id
    );

    if (!hasFilter) {
      ctx.addIssue({
        code: "custom",
        path: ["filters"],
        message: "Minimal satu filter harus diisi untuk aksi massal",
      });
    }

    if (val.action === "reassign_shift" && !val.payload?.shift_id) {
      ctx.addIssue({
        code: "custom",
        path: ["payload", "shift_id"],
        message: "Pilih shift tujuan untuk aksi ganti shift",
      });
    }
  });

export type BulkEditValues = z.infer<typeof bulkEditSchema>;
