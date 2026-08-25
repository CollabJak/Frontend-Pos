import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  PaginatedApiResponse,
  PromotionAction,
  PromotionActionFormData,
} from "../types/types";

interface FetchPromotionActionsParams {
  page?: number;
  per_page?: number;
  search?: string;
  promotion_id?: number;
}

const normalizePayload = (payload: PromotionActionFormData) => payload;

export const useFetchPromotionActions = ({
  page = 1,
  per_page,
  search,
  promotion_id,
}: FetchPromotionActionsParams = {}) => {
  return useQuery<PaginatedApiResponse<PromotionAction>, AxiosError>({
    queryKey: ["promotion-actions", page, search ?? "", promotion_id ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/promotion-actions", {
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

export const useFetchActionsByPromotionId = (promotionId: number | null | undefined) => {
  return useQuery<PromotionAction[], AxiosError>({
    queryKey: ["promotion-actions", "by-promotion", promotionId],
    queryFn: async () => {
      if (!promotionId) return [];
      const response = await apiClient.get("/promotion-actions", {
        params: { promotion_id: promotionId, per_page: 100 },
      });
      return response.data.data.data;
    },
    enabled: !!promotionId,
  });
};

export const useFetchPromotionAction = (id: number) => {
  return useQuery<PromotionAction, AxiosError>({
    queryKey: ["promotion-action", id],
    queryFn: async () => {
      const response = await apiClient.get(`/promotion-actions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreatePromotionAction = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    PromotionAction,
    AxiosError<ApiErrorResponse>,
    PromotionActionFormData
  >({
    mutationFn: async (payload: PromotionActionFormData) => {
      const response = await apiClient.post(
        "/promotion-actions",
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-actions"] });
      navigate("/promotions?tab=actions");
    },
  });
};

export const useUpdatePromotionAction = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    PromotionAction,
    AxiosError<ApiErrorResponse>,
    { id: number } & PromotionActionFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(
        `/promotion-actions/${id}`,
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["promotion-actions"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-action", id] });
      navigate("/promotions?tab=actions");
    },
  });
};

export const useDeletePromotionAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/promotion-actions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-actions"] });
    },
  });
};
