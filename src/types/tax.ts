export type TaxType = "percentage" | "fixed";

export interface Tax {
  id: number;
  business_id: number;
  name: string;
  code: string | null;
  rate: number;
  rate_formatted: string;
  type: TaxType;
  is_active: boolean;
  is_default: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxPayload {
  name: string;
  code?: string | null;
  rate: number;
  type?: TaxType;
  is_active?: boolean;
  is_default?: boolean;
  description?: string | null;
}

export interface TaxListParams {
  search?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface TaxListResponse {
  data: Tax[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
