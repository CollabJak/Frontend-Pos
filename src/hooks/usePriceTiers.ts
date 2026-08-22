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
import { DOMAINS, invalidateDomain } from "../constants/queryKeys";

interface FetchPriceTiersParams {
  page?: number;
  search?: string;
}

const normalizePayload = (payload: PriceTierFormData) => ({
  ...payload,
  end_date: payload.end_date && payload.end_date.trim() !== "" ? payload.end_date : null,
});

export const useFetchPriceTiers = ({ page = 1, search }: FetchPriceTiersParams) => {
  return useQuery<PaginatedApiResponse<PriceTier>, AxiosError>({
    queryKey: ["price-tiers", page, search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/price-tiers", {
        params: { page, ...(search ? {search} : {}) },
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
      invalidateDomain(queryClient, DOMAINS.PRICE_TIERS);
      navigate("/products?tab=tiers");
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
      invalidateDomain(queryClient, DOMAINS.PRICE_TIERS, id);
      navigate("/products?tab=tiers");
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
      invalidateDomain(queryClient, DOMAINS.PRICE_TIERS);
    },
  });
};
