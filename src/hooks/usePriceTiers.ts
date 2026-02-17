import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  PaginatedApiResponse,
  PriceTier,
  PriceTierFormData,
} from "../types/types";

interface FetchPriceTiersParams {
  page?: number;
}

const normalizePayload = (payload: PriceTierFormData) => ({
  ...payload,
  end_date: payload.end_date && payload.end_date.trim() !== "" ? payload.end_date : null,
});

export const useFetchPriceTiers = ({ page = 1 }: FetchPriceTiersParams) => {
  return useQuery<PaginatedApiResponse<PriceTier>, AxiosError>({
    queryKey: ["price-tiers", page],
    queryFn: async () => {
      const response = await apiClient.get("/price-tiers", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchPriceTier = (id: number) => {
  return useQuery<PriceTier, AxiosError>({
    queryKey: ["price-tier", id],
    queryFn: async () => {
      const response = await apiClient.get(`/price-tiers/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreatePriceTier = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<PriceTier, AxiosError<ApiErrorResponse>, PriceTierFormData>({
    mutationFn: async (payload: PriceTierFormData) => {
      const response = await apiClient.post("/price-tiers", normalizePayload(payload));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-tiers"] });
      navigate("/price-tiers");
    },
  });
};

export const useUpdatePriceTier = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    PriceTier,
    AxiosError<ApiErrorResponse>,
    { id: number } & PriceTierFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/price-tiers/${id}`, normalizePayload(payload));
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["price-tiers"] });
      queryClient.invalidateQueries({ queryKey: ["price-tier", id] });
      navigate("/price-tiers");
    },
  });
};

export const useDeletePriceTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/price-tiers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-tiers"] });
    },
  });
};
