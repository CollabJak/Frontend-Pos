import { z } from 'zod';

type PaymentMethodSchemaOptions = {
    hasExistingQrImage?: boolean;
};

const isFileLike = (value: unknown) => typeof File !== 'undefined' && value instanceof File;

export const createPaymentMethodSchema = (options: PaymentMethodSchemaOptions = {}) => z.object({
    scope: z.enum(['system', 'business'], {
        message: 'Cakupan wajib dipilih',
    }),
    type: z.enum(['qris', 'bank_transfer', 'e_wallet', 'cash'], {
        message: 'Tipe pembayaran wajib dipilih',
    }),
    name: z.string().min(1, 'Nama metode wajib diisi').max(255, 'Nama metode maksimal 255 karakter'),
    code: z.string().max(255, 'Kode maksimal 255 karakter').optional(),
    provider_name: z.string().max(255, 'Nama penyedia maksimal 255 karakter').optional(),
    account_name: z.string().max(255, 'Nama pemilik rekening maksimal 255 karakter').optional(),
    account_number: z.string().max(255, 'Nomor rekening / telepon maksimal 255 karakter').optional(),
    description: z.string().optional(),
    payment_instructions: z.string().optional(),
    qr_image: z.any().optional(),
    is_active: z.boolean().default(true),
    is_default: z.boolean().default(false),
    sort_order: z.number().default(0),
    metadata: z.any().optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'qris' && !options.hasExistingQrImage && !isFileLike(data.qr_image)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Gambar QRIS wajib diunggah",
            path: ["qr_image"]
        });
    }

    if (data.type === 'bank_transfer' || data.type === 'e_wallet') {
        if (!data.provider_name || data.provider_name.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: data.type === 'bank_transfer' ? "Nama bank wajib diisi" : "Penyedia e-wallet wajib diisi",
                path: ["provider_name"]
            });
        }
        if (!data.account_name || data.account_name.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Nama pemilik rekening wajib diisi",
                path: ["account_name"]
            });
        }
        if (!data.account_number || data.account_number.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: data.type === 'bank_transfer' ? "Nomor rekening wajib diisi" : "Nomor telepon / HP wajib diisi",
                path: ["account_number"]
            });
        }
    }
});

export const PaymentMethodSchema = createPaymentMethodSchema();

export type PaymentMethodSchemaType = z.infer<ReturnType<typeof createPaymentMethodSchema>>;
