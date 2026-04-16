export interface MerchantProfile {
  id?: number;
  name?: string | null;
  address?: string | null;
  photo?: string | null;
  phone?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  phone: string;
  business_id?: number | null;
  email_verified_at?: string;
  roles?: string[];
  permissions?: string[];
  merchant?: MerchantProfile | null;
}
