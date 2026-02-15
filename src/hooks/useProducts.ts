import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { Product } from "../types/types";
import { PaginatedApiResponse, ProductFormData, ApiErrorResponse } from "../types/types";
import { useNavigate } from "react-router";

interface fetchProductsParams {
  page?: number;
}

export const useFetchProducts = ({
  page = 1,
}: fetchProductsParams) => {
  return useQuery<PaginatedApiResponse<Product>, AxiosError>({
    queryKey: ["products", page],
    queryFn: async () => {
      const response = await apiClient.get("/products", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchProduct = (id: number) => {
  return useQuery<Product, AxiosError>({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Prevent fetching when id is undefined
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Product, AxiosError<ApiErrorResponse>, ProductFormData>({
    mutationFn: async (payload: ProductFormData) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      if(payload.barcode) {
        formData.append("barcode", payload.barcode);
      }
      formData.append("category_id", payload.category_id.toString());
      formData.append("brand_id", payload.brand_id.toString());
      formData.append("unit_id", payload.unit_id.toString());
      if(payload.description) {
        formData.append("description", payload.description);
      }
      formData.append("status", payload.status);
      formData.append("is_sellable", payload.is_sellable ? "1" : "0");
      formData.append("is_purchasable", payload.is_purchasable ? "1" : "0");
      formData.append("has_variant", payload.has_variant ? "1" : "0");
      if(payload.thumbnail) {
        formData.append("thumbnail", payload.thumbnail);
      }
      const response = await apiClient.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Product, // response type
    AxiosError<ApiErrorResponse>, // error type
    { id: number } & ProductFormData // payload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      if(payload.barcode) {
        formData.append("barcode", payload.barcode);
      }
      formData.append("category_id", payload.category_id.toString());
      formData.append("brand_id", payload.brand_id.toString());
      formData.append("unit_id", payload.unit_id.toString());
      if(payload.description) {
        formData.append("description", payload.description);
      }
      formData.append("status", payload.status);
      formData.append("is_sellable", payload.is_sellable ? "1" : "0");
      formData.append("is_purchasable", payload.is_purchasable ? "1" : "0");
      formData.append("has_variant", payload.has_variant ? "1" : "0");
      if(payload.thumbnail) {
        formData.append("thumbnail", payload.thumbnail);
      }
      formData.append("_method", "PUT");
      const response = await apiClient.post(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      navigate("/products");
    },
  });
};


export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
