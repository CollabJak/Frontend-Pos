import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  CreatePromotionPayload,
  PaginatedApiResponse,
  Promotion,
} from "../types/types";
import { DOMAINS, invalidateDomain } from "../constants/queryKeys";

interface FetchPromotionsParams {
  page?: number;
  search?: string;
}

const normalizePayload = (payload: CreatePromotionPayload) => ({
  ...payload,
  end_date: payload.end_date && payload.end_date.trim() !== "" ? payload.end_date : null,
});

export const useFetchPromotions = ({ page = 1, search }: FetchPromotionsParams) => {
  return useQuery<PaginatedApiResponse<Promotion>, AxiosError>({
    queryKey: ["promotions", page, search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/promotions", {
        params: { page, ...(search ? {search} : {}) },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchPromotion = (id: number) => {
  return useQuery<Promotion, AxiosError>({
    queryKey: ["promotion", id],
    queryFn: async () => {
      const response = await apiClient.get(`/promotions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useFetchPromotionWithDetails = (id: number) => {
  return useQuery({
    queryKey: ["promotion-with-details", id],
    queryFn: async () => {
      const [promoRes, condRes, actRes, prodRes] = await Promise.all([
        apiClient.get(`/promotions/${id}`),
        apiClient.get("/promotion-conditions", { params: { promotion_id: id, per_page: 100 } }),
        apiClient.get("/promotion-actions", { params: { promotion_id: id, per_page: 100 } }),
        apiClient.get("/promotion-products", { params: { promotion_id: id, per_page: 100 } }),
      ]);

      return {
        promotion: promoRes.data.data as Promotion,
        conditions: condRes.data.data.data,
        actions: actRes.data.data.data,
        products: prodRes.data.data.data,
      };
    },
    enabled: !!id,
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Promotion, AxiosError<ApiErrorResponse>, CreatePromotionPayload>({
    mutationFn: async (payload: CreatePromotionPayload) => {
      const response = await apiClient.post("/promotions", normalizePayload(payload));
      return response.data.data;
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.PROMOTIONS);
      navigate("/promotions");
    },
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Promotion,
    AxiosError<ApiErrorResponse>,
    { id: number } & CreatePromotionPayload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/promotions/${id}`, normalizePayload(payload));
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      invalidateDomain(queryClient, DOMAINS.PROMOTIONS, id);
      queryClient.invalidateQueries({ queryKey: ["promotion-with-details", id] });
      navigate("/promotions");
    },
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/promotions/${id}`);
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.PROMOTIONS);
      queryClient.invalidateQueries({ queryKey: ["promotion-conditions"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-actions"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-products"] });
    },
  });
};
