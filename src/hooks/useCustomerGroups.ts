import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  CreateCustomerGroupPayload,
  CustomerGroup,
  CustomerGroupWithPrices,
  PaginatedApiResponse,
} from "../types/types";
import { DOMAINS, invalidateDomain } from "../constants/queryKeys";

interface FetchCustomerGroupsParams {
  page?: number;
  search?: string;
}

export const useFetchCustomerGroups = ({ page = 1, search }: FetchCustomerGroupsParams) => {
  return useQuery<PaginatedApiResponse<CustomerGroup>, AxiosError>({
    queryKey: ["customer-groups", page, search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/customer-groups", {
        params: {
          page,
          ...(search ? { search } : {}),
        },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchCustomerGroup = (id: number) => {
  return useQuery<CustomerGroup, AxiosError>({
    queryKey: ["customer-group", id],
    queryFn: async () => {
      const response = await apiClient.get(`/customer-groups/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useFetchCustomerGroupWithPrices = (id: number) => {
  return useQuery<CustomerGroupWithPrices, AxiosError>({
    queryKey: ["customer-group-with-prices", id],
    queryFn: async () => {
      const [groupRes, pricesRes] = await Promise.all([
        apiClient.get(`/customer-groups/${id}`),
        apiClient.get("/customer-group-prices", {
          params: { customer_group_id: id, per_page: 100 },
        }),
      ]);

      const groupData = groupRes.data.data;
      const pricesData = pricesRes.data.data?.data || pricesRes.data.data || [];

      return {
        ...groupData,
        prices: Array.isArray(pricesData) ? pricesData : [],
      };
    },
    enabled: !!id && id > 0,
  });
};

export const useCreateCustomerGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<CustomerGroup, AxiosError<ApiErrorResponse>, CreateCustomerGroupPayload>({
    mutationFn: async (payload: CreateCustomerGroupPayload) => {
      const response = await apiClient.post("/customer-groups", payload);
      return response.data.data;
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.CUSTOMER_GROUPS);
      navigate("/customer-groups?tab=groups");
    },
  });
};

export const useUpdateCustomerGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    CustomerGroup,
    AxiosError<ApiErrorResponse>,
    { id: number } & CreateCustomerGroupPayload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/customer-groups/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      invalidateDomain(queryClient, DOMAINS.CUSTOMER_GROUPS, id);
      navigate("/customer-groups?tab=groups");
    },
  });
};

export const useDeleteCustomerGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/customer-groups/${id}`);
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.CUSTOMER_GROUPS);
    },
  });
};
