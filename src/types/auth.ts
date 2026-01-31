export interface User {
    id: number;
    name: string;
    email: string;
    photo: string;
    phone: string;
    email_verified_at?: string;
    roles?: string[];
  }