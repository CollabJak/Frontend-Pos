import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  CustomerGroupPrice,
  CustomerGroupPriceFormData,
  PaginatedApiResponse,
} from "../types/types";

interface FetchCustomerGroupPricesParams {
  page?: number;
}

const normalizePayload = (payload: CustomerGroupPriceFormData) => ({
  ...payload,
  end_date: payload.end_date && payload.end_date.trim() !== "" ? payload.end_date : null,
});

export const useFetchCustomerGroupPrices = ({ page = 1 }: FetchCustomerGroupPricesParams) => {
  return useQuery<PaginatedApiResponse<CustomerGroupPrice>, AxiosError>({
    queryKey: ["customer-group-prices", page],
    queryFn: async () => {
      const response = await apiClient.get("/customer-group-prices", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchCustomerGroupPrice = (id: number) => {
  return useQuery<CustomerGroupPrice, AxiosError>({
    queryKey: ["customer-group-price", id],
    queryFn: async () => {
      const response = await apiClient.get(`/customer-group-prices/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateCustomerGroupPrice = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    CustomerGroupPrice,
    AxiosError<ApiErrorResponse>,
    CustomerGroupPriceFormData
  >({
    mutationFn: async (payload: CustomerGroupPriceFormData) => {
      const response = await apiClient.post(
        "/customer-group-prices",
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-group-prices"] });
      navigate("/customer-group-prices");
    },
  });
};

export const useUpdateCustomerGroupPrice = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    CustomerGroupPrice,
    AxiosError<ApiErrorResponse>,
    { id: number } & CustomerGroupPriceFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(
        `/customer-group-prices/${id}`,
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["customer-group-prices"] });
      queryClient.invalidateQueries({ queryKey: ["customer-group-price", id] });
      navigate("/customer-group-prices");
    },
  });
};

export const useDeleteCustomerGroupPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/customer-group-prices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-group-prices"] });
    },
  });
};
