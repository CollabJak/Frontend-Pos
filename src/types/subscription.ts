export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'none';

export interface SubscriptionStatusData {
  has_active_subscription: boolean;
  status: SubscriptionStatus;
  end_date: string | null;
}

export type PaymentStatus = 'pending' | 'confirmation' | 'paid' | 'failed' | 'expired' | 'cancelled';

export interface SubscriptionPaymentDetail {
  id: number;
  invoice_number: string;
  amount: string;
  subtotal: string;
  tax_amount: string;
  payment_status: PaymentStatus;
  payment_method: string;
  paid_at: string | null;
  external_payment_id: string | null;
  billing_name: string;
  billing_email: string;
  billing_phone: string;
  subscription_plan: {
    id: number;
    name: string;
    duration: number;
    price: string;
    billing_cycle: string;
    features: {
      max_locations?: number;
      [key: string]: unknown;
    };
  };
  business: {
    id: number;
    name: string;
    code: string;
    email: string;
    phone: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}
