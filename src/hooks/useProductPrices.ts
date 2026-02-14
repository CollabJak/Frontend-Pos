import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  PaginatedApiResponse,
  ProductPrice,
  ProductPriceFormData,
} from "../types/types";

interface FetchProductPricesParams {
  page?: number;
}

const normalizePayload = (payload: ProductPriceFormData) => ({
  ...payload,
  end_date: payload.end_date && payload.end_date.trim() !== "" ? payload.end_date : null,
});

export const useFetchProductPrices = ({ page = 1 }: FetchProductPricesParams) => {
  return useQuery<PaginatedApiResponse<ProductPrice>, AxiosError>({
    queryKey: ["product-prices", page],
    queryFn: async () => {
      const response = await apiClient.get("/product-prices", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchProductPrice = (id: number) => {
  return useQuery<ProductPrice, AxiosError>({
    queryKey: ["product-price", id],
    queryFn: async () => {
      const response = await apiClient.get(`/product-prices/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateProductPrice = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    ProductPrice,
    AxiosError<ApiErrorResponse>,
    ProductPriceFormData
  >({
    mutationFn: async (payload: ProductPriceFormData) => {
      const response = await apiClient.post(
        "/product-prices",
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-prices"] });
      navigate("/product-prices");
    },
  });
};

export const useUpdateProductPrice = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    ProductPrice,
    AxiosError<ApiErrorResponse>,
    { id: number } & ProductPriceFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(
        `/product-prices/${id}`,
        normalizePayload(payload)
      );
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["product-prices"] });
      queryClient.invalidateQueries({ queryKey: ["product-price", id] });
      navigate("/product-prices");
    },
  });
};

export const useDeleteProductPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/product-prices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-prices"] });
    },
  });
};
