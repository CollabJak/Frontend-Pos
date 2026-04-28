export type PaymentMethodScope = 'system' | 'business';
export type PaymentMethodType = 'qris' | 'bank_transfer' | 'e_wallet' | 'cash';

export interface PaymentMethod {
    id: number;
    scope: PaymentMethodScope;
    business_id: number | null;
    type: PaymentMethodType;
    name: string;
    code: string | null;
    account_name: string | null;
    account_number: string | null;
    provider_name: string | null;
    description: string | null;
    payment_instructions: string | null;
    qr_image_path: string | null;
    qr_image_url: string | null;
    is_active: boolean;
    is_default: boolean;
    sort_order: number;
    metadata: any | null;
    created_at: string;
    updated_at: string;
}

export interface PaymentMethodFormData {
    scope: PaymentMethodScope;
    type: PaymentMethodType;
    name: string;
    code?: string;
    provider_name?: string;
    account_name?: string;
    account_number?: string;
    description?: string;
    payment_instructions?: string;
    qr_image?: File | null;
    is_active: boolean;
    is_default: boolean;
    sort_order: number;
    metadata?: any;
}
