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
  per_page?: number;
  search?: string;
  promotion_id?: number;
}

export const useFetchPromotionProducts = ({
  page = 1,
  per_page,
  search,
  promotion_id,
}: FetchPromotionProductsParams = {}) => {
  return useQuery<PaginatedApiResponse<PromotionProduct>, AxiosError>({
    queryKey: ["promotion-products", page, search ?? "", promotion_id ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/promotion-products", {
        params: {
          page,
          ...(per_page ? { per_page } : {}),
          ...(search ? { search } : {}),
          ...(promotion_id ? { promotion_id } : {}),
        },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchProductsByPromotionId = (promotionId: number | null | undefined) => {
  return useQuery<PromotionProduct[], AxiosError>({
    queryKey: ["promotion-products", "by-promotion", promotionId],
    queryFn: async () => {
      if (!promotionId) return [];
      const response = await apiClient.get("/promotion-products", {
        params: { promotion_id: promotionId, per_page: 100 },
      });
      return response.data.data.data;
    },
    enabled: !!promotionId,
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
      navigate("/promotions?tab=products");
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
      navigate("/promotions?tab=products");
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
