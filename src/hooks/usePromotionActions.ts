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
}

const normalizePayload = (payload: PromotionActionFormData) => payload;

export const useFetchPromotionActions = ({ page = 1 }: FetchPromotionActionsParams) => {
  return useQuery<PaginatedApiResponse<PromotionAction>, AxiosError>({
    queryKey: ["promotion-actions", page],
    queryFn: async () => {
      const response = await apiClient.get("/promotion-actions", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
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
      navigate("/promotion-actions");
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
      navigate("/promotion-actions");
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
