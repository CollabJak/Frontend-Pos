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

interface FetchPromotionsParams {
  page?: number;
}

const normalizePayload = (payload: CreatePromotionPayload) => ({
  ...payload,
  end_date: payload.end_date && payload.end_date.trim() !== "" ? payload.end_date : null,
});

export const useFetchPromotions = ({ page = 1 }: FetchPromotionsParams) => {
  return useQuery<PaginatedApiResponse<Promotion>, AxiosError>({
    queryKey: ["promotions", page],
    queryFn: async () => {
      const response = await apiClient.get("/promotions", {
        params: { page },
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

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Promotion, AxiosError<ApiErrorResponse>, CreatePromotionPayload>({
    mutationFn: async (payload: CreatePromotionPayload) => {
      const response = await apiClient.post("/promotions", normalizePayload(payload));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
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
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["promotion", id] });
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
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
};
