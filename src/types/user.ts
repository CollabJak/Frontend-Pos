export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  phone: string;
  photo?: File | null;
  business_id?: number | null;
}
