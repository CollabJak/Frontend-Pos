export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  curent_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    pagination: PaginationMeta;
  }
}