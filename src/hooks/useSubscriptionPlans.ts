import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  PaginatedApiResponse,
  SubscriptionPlan,
  SubscriptionPlanFormData,
} from "../types/types";

interface FetchSubscriptionPlansParams {
  page?: number;
}

const normalizePayload = (payload: SubscriptionPlanFormData) => ({
  ...payload,
  description:
    payload.description && payload.description.trim() !== ""
      ? payload.description.trim()
      : null,
});

export const useFetchSubscriptionPlans = ({
  page = 1,
}: FetchSubscriptionPlansParams) => {
  return useQuery<PaginatedApiResponse<SubscriptionPlan>, AxiosError>({
    queryKey: ["subscription-plans", page],
    queryFn: async () => {
      const response = await apiClient.get("/subscription-plans", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchSubscriptionPlan = (id: number) => {
  return useQuery<SubscriptionPlan, AxiosError>({
    queryKey: ["subscription-plan", id],
    queryFn: async () => {
      const response = await apiClient.get(`/subscription-plans/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useUpsertSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SubscriptionPlan,
    AxiosError<ApiErrorResponse>,
    { id?: number; data: SubscriptionPlanFormData }
  >({
    mutationFn: async ({ id, data }) => {
      const response = id
        ? await apiClient.put(`/subscription-plans/${id}`, normalizePayload(data))
        : await apiClient.post("/subscription-plans", normalizePayload(data));

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    SubscriptionPlan,
    AxiosError<ApiErrorResponse>,
    SubscriptionPlanFormData
  >({
    mutationFn: async (payload: SubscriptionPlanFormData) => {
      const response = await apiClient.post(
        "/subscription-plans",
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      navigate("/subscriptions-plans");
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    SubscriptionPlan,
    AxiosError<ApiErrorResponse>,
    { id: number } & SubscriptionPlanFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(
        `/subscription-plans/${id}`,
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plan", id] });
      navigate("/subscriptions-plans");
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/subscription-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
  });
};
