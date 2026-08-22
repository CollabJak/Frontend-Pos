import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { Product, CompositeProductFormData } from "../types/product";
import { PaginatedApiResponse, ApiErrorResponse } from "../types/types";
import { useNavigate } from "react-router";
import { DOMAINS, invalidateDomain } from "../constants/queryKeys";

interface fetchProductsParams {
  page?: number;
  search?: string;
}

export const useFetchProducts = ({
  page = 1, search
}: fetchProductsParams) => {
  return useQuery<PaginatedApiResponse<Product>, AxiosError>({
    queryKey: ["products", page, search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/products", {
        params: { page, ...(search) ? {search} : {} },
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
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Product, AxiosError<ApiErrorResponse>, CompositeProductFormData>({
    mutationFn: async (payload: CompositeProductFormData) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("barcode", payload.barcode ?? "");
      formData.append("category_id", payload.category_id.toString());
      formData.append("brand_id", payload.brand_id.toString());
      formData.append("description", payload.description ?? "");
      formData.append("status", payload.status ?? "active");
      formData.append("is_sellable", payload.is_sellable ? "1" : "0");
      formData.append("is_purchasable", payload.is_purchasable ? "1" : "0");
      formData.append("has_variant", payload.has_variant ? "1" : "0");

      if (payload.thumbnail) {
        formData.append("thumbnail", payload.thumbnail);
      }

      if (payload.variants && payload.variants.length > 0) {
        payload.variants.forEach((variant, vIdx) => {
          if (variant.id) {
            formData.append(`variants[${vIdx}][id]`, variant.id.toString());
          }
          formData.append(`variants[${vIdx}][name]`, variant.name);
          if (variant.barcode) {
            formData.append(`variants[${vIdx}][barcode]`, variant.barcode);
          }
          if (variant.location_id) {
            formData.append(`variants[${vIdx}][location_id]`, variant.location_id.toString());
          }
          formData.append(`variants[${vIdx}][base_unit_id]`, variant.base_unit_id.toString());
          formData.append(`variants[${vIdx}][selling_price]`, variant.selling_price.toString());
          if (variant.cost_price !== undefined && variant.cost_price !== null) {
            formData.append(`variants[${vIdx}][cost_price]`, variant.cost_price.toString());
          }
          if (variant.attributes_json && variant.attributes_json.length > 0) {
            variant.attributes_json.forEach((attr, aIdx) => {
              formData.append(`variants[${vIdx}][attributes_json][${aIdx}][atribute_id]`, attr.atribute_id.toString());
              formData.append(`variants[${vIdx}][attributes_json][${aIdx}][value]`, attr.value);
            });
          }
        });
      }

      const response = await apiClient.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.PRODUCTS);
      navigate("/products?tab=products");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Product,
    AxiosError<ApiErrorResponse>,
    { id: number } & CompositeProductFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("barcode", payload.barcode ?? "");
      formData.append("category_id", payload.category_id.toString());
      formData.append("brand_id", payload.brand_id.toString());
      formData.append("description", payload.description ?? "");
      formData.append("status", payload.status ?? "active");
      formData.append("is_sellable", payload.is_sellable ? "1" : "0");
      formData.append("is_purchasable", payload.is_purchasable ? "1" : "0");
      formData.append("has_variant", payload.has_variant ? "1" : "0");

      if (payload.thumbnail) {
        formData.append("thumbnail", payload.thumbnail);
      }

      if (payload.variants && payload.variants.length > 0) {
        payload.variants.forEach((variant, vIdx) => {
          if (variant.id) {
            formData.append(`variants[${vIdx}][id]`, variant.id.toString());
          }
          formData.append(`variants[${vIdx}][name]`, variant.name);
          if (variant.barcode) {
            formData.append(`variants[${vIdx}][barcode]`, variant.barcode);
          }
          if (variant.location_id) {
            formData.append(`variants[${vIdx}][location_id]`, variant.location_id.toString());
          }
          formData.append(`variants[${vIdx}][base_unit_id]`, variant.base_unit_id.toString());
          formData.append(`variants[${vIdx}][selling_price]`, variant.selling_price.toString());
          if (variant.cost_price !== undefined && variant.cost_price !== null) {
            formData.append(`variants[${vIdx}][cost_price]`, variant.cost_price.toString());
          }
          if (variant.attributes_json && variant.attributes_json.length > 0) {
            variant.attributes_json.forEach((attr, aIdx) => {
              formData.append(`variants[${vIdx}][attributes_json][${aIdx}][atribute_id]`, attr.atribute_id.toString());
              formData.append(`variants[${vIdx}][attributes_json][${aIdx}][value]`, attr.value);
            });
          }
        });
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
      invalidateDomain(queryClient, DOMAINS.PRODUCTS, id);
      navigate("/products?tab=products");
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
      invalidateDomain(queryClient, DOMAINS.PRODUCTS);
    },
  });
};
