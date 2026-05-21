import { z } from 'zod';

type PaymentMethodSchemaOptions = {
    hasExistingQrImage?: boolean;
};

const isFileLike = (value: unknown) => typeof File !== 'undefined' && value instanceof File;

export const createPaymentMethodSchema = (options: PaymentMethodSchemaOptions = {}) => z.object({
    scope: z.enum(['system', 'business']),
    type: z.enum(['qris', 'bank_transfer', 'e_wallet', 'cash']),
    name: z.string().min(1, 'Name is required').max(255),
    code: z.string().max(255).optional(),
    provider_name: z.string().max(255).optional(),
    account_name: z.string().max(255).optional(),
    account_number: z.string().max(255).optional(),
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
            message: "QR Code Image is required",
            path: ["qr_image"]
        });
    }

    if (data.type === 'bank_transfer' || data.type === 'e_wallet') {
        if (!data.provider_name || data.provider_name.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: data.type === 'bank_transfer' ? "Bank Name is required" : "E-Wallet Provider is required",
                path: ["provider_name"]
            });
        }
        if (!data.account_name || data.account_name.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Account Holder Name is required",
                path: ["account_name"]
            });
        }
        if (!data.account_number || data.account_number.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: data.type === 'bank_transfer' ? "Account Number is required" : "Phone Number is required",
                path: ["account_number"]
            });
        }
    }
});

export const PaymentMethodSchema = createPaymentMethodSchema();

export type PaymentMethodSchemaType = z.infer<ReturnType<typeof createPaymentMethodSchema>>;
