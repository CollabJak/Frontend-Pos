import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  PaginatedApiResponse,
  ProductVariant,
  ProductVariantFormData,
} from "../types/types";
import { DOMAINS, invalidateDomain } from "../constants/queryKeys";

interface FetchProductVariantsParams {
  page?: number;
  search?: string;
}

export const useFetchProductVariants = ({
  page = 1, search
}: FetchProductVariantsParams) => {
  return useQuery<PaginatedApiResponse<ProductVariant>, AxiosError>({
    queryKey: ["product-variants", page, search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/product-variants", {
        params: { page, ...(search ? {search} : {}) },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateProductVariant = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    ProductVariant,
    AxiosError<ApiErrorResponse>,
    ProductVariantFormData
  >({
    mutationFn: async (payload: ProductVariantFormData) => {
      const response = await apiClient.post("/product-variants", payload);
      return response.data.data;
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.PRODUCT_VARIANTS);
      navigate("/products?tab=variants");
    },
  });
};

export const useFetchProductVariant = (id: number) => {
  return useQuery<ProductVariant, AxiosError>({
    queryKey: ["product-variant", id],
    queryFn: async () => {
      const response = await apiClient.get(`/product-variants/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    ProductVariant,
    AxiosError<ApiErrorResponse>,
    { id: number } & ProductVariantFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/product-variants/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      invalidateDomain(queryClient, DOMAINS.PRODUCT_VARIANTS, id);
      navigate("/products?tab=variants");
    },
  });
};

export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/product-variants/${id}`);
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.PRODUCT_VARIANTS);
    },
  });
};
