import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi").min(8, "Kata sandi minimal 8 karakter"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  photo: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        ["image/png", "image/jpeg"].includes(file.type),
      {
        message: "Format gambar tidak valid. Gunakan PNG atau JPEG.",
      }
    )
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        file.size <= 2 * 1024 * 1024,
      {
        message: "Ukuran gambar maksimal 2MB.",
      }
    ),
  business_id: z.number().optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Kata sandi minimal 8 karakter",
    }),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  photo: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        ["image/png", "image/jpeg"].includes(file.type),
      {
        message: "Format gambar tidak valid. Gunakan PNG atau JPEG.",
      }
    )
    .refine(
      (file) =>
        file === null ||
        file === undefined ||
        file.size <= 2 * 1024 * 1024,
      {
        message: "Ukuran gambar maksimal 2MB.",
      }
    ),
  business_id: z.number().optional().nullable(),
});

export const userSchema = createUserSchema;

export type UserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const syncUserLocationsSchema = z.object({
  location_ids: z.array(z.number()).min(1, "Pilih setidaknya satu lokasi kerja."),
  primary_location_id: z.number().nullable().refine((val) => val !== null && val !== undefined, "Pilih satu lokasi utama."),
}).refine((data) => data.primary_location_id !== null && data.location_ids.includes(data.primary_location_id!), {
  message: "Lokasi utama harus salah satu dari lokasi yang dipilih.",
  path: ["primary_location_id"],
});

export type SyncUserLocationsFormData = z.infer<typeof syncUserLocationsSchema>;

