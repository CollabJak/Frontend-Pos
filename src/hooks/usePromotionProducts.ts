import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  PaginatedApiResponse,
  PromotionProduct,
  PromotionProductFormData,
} from "../types/types";

interface FetchPromotionProductsParams {
  page?: number;
}

export const useFetchPromotionProducts = ({ page = 1 }: FetchPromotionProductsParams) => {
  return useQuery<PaginatedApiResponse<PromotionProduct>, AxiosError>({
    queryKey: ["promotion-products", page],
    queryFn: async () => {
      const response = await apiClient.get("/promotion-products", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchPromotionProduct = (id: number) => {
  return useQuery<PromotionProduct, AxiosError>({
    queryKey: ["promotion-product", id],
    queryFn: async () => {
      const response = await apiClient.get(`/promotion-products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreatePromotionProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    PromotionProduct,
    AxiosError<ApiErrorResponse>,
    PromotionProductFormData
  >({
    mutationFn: async (payload: PromotionProductFormData) => {
      const response = await apiClient.post("/promotion-products", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-products"] });
      navigate("/promotion-products");
    },
  });
};

export const useUpdatePromotionProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    PromotionProduct,
    AxiosError<ApiErrorResponse>,
    { id: number } & PromotionProductFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/promotion-products/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["promotion-products"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-product", id] });
      navigate("/promotion-products");
    },
  });
};

export const useDeletePromotionProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/promotion-products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-products"] });
    },
  });
};
