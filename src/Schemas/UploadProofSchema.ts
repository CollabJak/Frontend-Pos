import * as z from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const UploadProofSchema = z.object({
    file: z
        .any()
        .refine((files) => {
            if (!files) return false;
            if (files instanceof FileList) return files.length === 1;
            if (Array.isArray(files)) return files.length === 1;
            return true;
        }, "Pilih bukti pembayaran (gambar)")
        .refine((files) => {
            const file = files instanceof FileList ? files[0] : (Array.isArray(files) ? files[0] : files);
            return file?.size <= MAX_FILE_SIZE;
        }, "Ukuran file maksimal 2MB")
        .refine((files) => {
            const file = files instanceof FileList ? files[0] : (Array.isArray(files) ? files[0] : files);
            return ACCEPTED_IMAGE_TYPES.includes(file?.type);
        }, "Hanya menerima file .jpg, .jpeg, atau .png"),
});

export type UploadProofFormData = z.infer<typeof UploadProofSchema>;
