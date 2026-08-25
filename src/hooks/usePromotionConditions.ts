import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  PaginatedApiResponse,
  PromotionCondition,
  PromotionConditionFormData,
} from "../types/types";

interface FetchPromotionConditionsParams {
  page?: number;
  per_page?: number;
  search?: string;
  promotion_id?: number;
}

const normalizePayload = (payload: PromotionConditionFormData) => payload;

export const useFetchPromotionConditions = ({
  page = 1,
  per_page,
  search,
  promotion_id,
}: FetchPromotionConditionsParams = {}) => {
  return useQuery<PaginatedApiResponse<PromotionCondition>, AxiosError>({
    queryKey: ["promotion-conditions", page, search ?? "", promotion_id ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/promotion-conditions", {
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

export const useFetchConditionsByPromotionId = (promotionId: number | null | undefined) => {
  return useQuery<PromotionCondition[], AxiosError>({
    queryKey: ["promotion-conditions", "by-promotion", promotionId],
    queryFn: async () => {
      if (!promotionId) return [];
      const response = await apiClient.get("/promotion-conditions", {
        params: { promotion_id: promotionId, per_page: 100 },
      });
      return response.data.data.data;
    },
    enabled: !!promotionId,
  });
};

export const useFetchPromotionCondition = (id: number) => {
  return useQuery<PromotionCondition, AxiosError>({
    queryKey: ["promotion-condition", id],
    queryFn: async () => {
      const response = await apiClient.get(`/promotion-conditions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreatePromotionCondition = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    PromotionCondition,
    AxiosError<ApiErrorResponse>,
    PromotionConditionFormData
  >({
    mutationFn: async (payload: PromotionConditionFormData) => {
      const response = await apiClient.post(
        "/promotion-conditions",
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-conditions"] });
      navigate("/promotions?tab=conditions");
    },
  });
};

export const useUpdatePromotionCondition = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    PromotionCondition,
    AxiosError<ApiErrorResponse>,
    { id: number } & PromotionConditionFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(
        `/promotion-conditions/${id}`,
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["promotion-conditions"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-condition", id] });
      navigate("/promotions?tab=conditions");
    },
  });
};

export const useDeletePromotionCondition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/promotion-conditions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-conditions"] });
    },
  });
};
