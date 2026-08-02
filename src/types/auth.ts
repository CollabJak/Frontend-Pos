import { Location } from "./location";

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
  is_email_verified?: boolean;
  roles?: string[];
  permissions?: string[];
  merchant?: MerchantProfile | null;
  has_active_subscription?: boolean;
  subscription_status?: string | null;
  subscription_ends_at?: string | null;
  locations?: Location[];
  primary_location?: Location | null;
}
