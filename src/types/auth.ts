export interface User {
    id: number;
    name: string;
    email: string;
    photo: string;
    phone: string;
    business_id?: number | null;
    email_verified_at?: string;
    roles?: string[];
  }
