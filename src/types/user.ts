export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  phone: string;
  photo?: File | null;
  business_id?: number | null;
}

export interface SyncUserLocationsPayload {
  location_ids: number[];
  primary_location_id: number;
}

export interface UpdateUserProfilePayload {
  name: string;
  email: string;
  phone: string;
  photo?: File | null;
}
