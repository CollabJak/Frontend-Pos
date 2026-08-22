import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  ApiResponse,
  CreateCustomerPayload,
  Customer,
  CustomerOption,
  PaginatedApiResponse,
} from "../types/types";
import { DOMAINS, invalidateDomain } from "../constants/queryKeys";

interface FetchCustomersParams {
  page?: number;
  per_page?: number;
  search?: string;
  customer_group_id?: number | null;
  is_active?: boolean;
}

export const useFetchCustomers = ({
  page = 1,
  per_page = 10,
  search,
  customer_group_id,
  is_active,
}: FetchCustomersParams = {}) => {
  return useQuery<PaginatedApiResponse<Customer>, AxiosError>({
    queryKey: ["customers", page, per_page, search ?? "", customer_group_id ?? "", is_active ?? ""],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaginatedApiResponse<Customer>>>("/customers", {
        params: {
          page,
          per_page,
          ...(search ? { search: search.trim() } : {}),
          ...(customer_group_id ? { customer_group_id } : {}),
          ...(is_active !== undefined ? { is_active } : {}),
        },
      });

      return response.data.data as PaginatedApiResponse<Customer>;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchCustomer = (id: number) => {
  return useQuery<Customer, AxiosError>({
    queryKey: ["customer", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
      return response.data.data as Customer;
    },
    enabled: !!id,
  });
};

export const useSearchCustomer = (query: string) => {
  return useQuery<Customer, AxiosError>({
    queryKey: ["customer-search", query],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Customer>>("/customers/search", {
        params: { q: query.trim() },
      });
      return response.data.data as Customer;
    },
    enabled: query.trim().length >= 2,
    retry: false,
  });
};

export const useCustomerOptions = (search?: string) => {
  return useQuery<CustomerOption[], AxiosError>({
    queryKey: ["options", "customers", search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CustomerOption[]>>("/options/customers", {
        params: {
          limit: 30,
          ...(search ? { search: search.trim() } : {}),
        },
      });
      return (response.data.data ?? []) as CustomerOption[];
    },
    staleTime: 1000 * 30, // 30 seconds cache
  });
};

export const useCreateCustomer = (redirectOnSuccess: boolean = true) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Customer, AxiosError<ApiErrorResponse>, CreateCustomerPayload>({
    mutationFn: async (payload: CreateCustomerPayload) => {
      const response = await apiClient.post<ApiResponse<Customer>>("/customers", payload);
      return response.data.data as Customer;
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.CUSTOMERS);
      if (redirectOnSuccess) {
        navigate("/customer-groups?tab=customers");
      }
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Customer,
    AxiosError<ApiErrorResponse>,
    { id: number } & Partial<CreateCustomerPayload>
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, payload);
      return response.data.data as Customer;
    },
    onSuccess: (_, { id }) => {
      invalidateDomain(queryClient, DOMAINS.CUSTOMERS, id);
      navigate("/customer-groups?tab=customers");
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.CUSTOMERS);
    },
  });
};
