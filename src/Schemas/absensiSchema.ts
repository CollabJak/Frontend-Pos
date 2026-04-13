import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const imageFileSchema = z
  .any()
  .refine((file) => file instanceof File, "Gambar wajah diperlukan.")
  .refine((file) => file?.size <= MAX_FILE_SIZE, `Ukuran maksimal adalah 5MB.`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
    "Hanya format .jpg, .jpeg, dan .png yang didukung."
  );

export const faceRegistrationSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap harus diisi"),
  email: z.string().email("Email tidak valid").min(1, "Email wajib diisi"),
  face_image: imageFileSchema,
  isActive: z.boolean().optional().default(true),
});

export const attendanceActionSchema = z.object({
  face_image: imageFileSchema,
});

export type FaceRegistrationFormValues = z.infer<typeof faceRegistrationSchema>;
export type AttendanceActionFormValues = z.infer<typeof attendanceActionSchema>;
