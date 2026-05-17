import { z } from "zod";

export const holidayCalendarSchema = z.object({
  name: z.string().min(1, "Nama hari libur wajib diisi"),
  holiday_date: z.string().min(1, "Tanggal wajib diisi"),
  type: z.enum(["national", "company", "location"]),
  location_id: z.number().nullable().optional(),
  is_recurring: z.boolean(),
  description: z.string().nullable().optional(),
}).refine((data) => {
  if (data.type === "location" && !data.location_id) {
    return false;
  }
  return true;
}, {
  message: "Lokasi wajib dipilih jika tipe adalah 'location'",
  path: ["location_id"],
});

export type HolidayCalendarFormValues = z.infer<typeof holidayCalendarSchema>;

export const holidayBatchItemSchema = holidayCalendarSchema;

export const holidayBatchCreateSchema = z.object({
  holidays: z.array(holidayBatchItemSchema).min(1, "Minimal tambahkan 1 hari libur"),
});

export type HolidayBatchCreateFormValues = z.infer<typeof holidayBatchCreateSchema>;
