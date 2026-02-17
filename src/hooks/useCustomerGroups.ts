import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import apiClient from "../api/axiosConfig";
import { ApiErrorResponse, CreateCustomerGroupPayload, CustomerGroup, PaginatedApiResponse } from "../types/types";

interface FetchCustomerGroupsParams {
  page?: number;
}

export const useFetchCustomerGroups = ({ page = 1 }: FetchCustomerGroupsParams) => {
  return useQuery<PaginatedApiResponse<CustomerGroup>, AxiosError>({
    queryKey: ["customer-groups", page],
    queryFn: async () => {
      const response = await apiClient.get("/customer-groups", {
        params: { page },
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

export const useCreateCustomerGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<CustomerGroup, AxiosError<ApiErrorResponse>, CreateCustomerGroupPayload>({
    mutationFn: async (payload: CreateCustomerGroupPayload) => {
      const response = await apiClient.post("/customer-groups", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-groups"] });
      navigate("/customer-groups");
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
      queryClient.invalidateQueries({ queryKey: ["customer-groups"] });
      queryClient.invalidateQueries({ queryKey: ["customer-group", id] });
      navigate("/customer-groups");
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
      queryClient.invalidateQueries({ queryKey: ["customer-groups"] });
    },
  });
};
