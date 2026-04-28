import { z } from 'zod';

export const PaymentMethodSchema = z.object({
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
}).refine((data) => {
    if (data.type === 'bank_transfer' || data.type === 'e_wallet') {
        return !!data.provider_name && !!data.account_name && !!data.account_number;
    }
    return true;
}, {
    message: "Provider, Account Name, and Account Number are required for this type",
    path: ["provider_name"]
});

export type PaymentMethodSchemaType = z.infer<typeof PaymentMethodSchema>;
