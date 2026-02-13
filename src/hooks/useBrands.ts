import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { Brand } from "../types/types";
import { PaginatedApiResponse, CreateBrandPayload, ApiErrorResponse } from "../types/types";
import { useNavigate } from "react-router";

interface fetchBrandsParams {
  page?: number;
}

export const useFetchBrands = ({
  page = 1,
}: fetchBrandsParams) => {
  return useQuery<PaginatedApiResponse<Brand>, AxiosError>({
    queryKey: ["brands", page],
    queryFn: async () => {
      const response = await apiClient.get("/brands", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchBrand = (id: number) => {
  return useQuery<Brand, AxiosError>({
    queryKey: ["brand", id],
    queryFn: async () => {
      const response = await apiClient.get(`/brands/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Prevent fetching when id is undefined
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Brand, AxiosError<ApiErrorResponse>, CreateBrandPayload>({
    mutationFn: async (payload: CreateBrandPayload) => {
      const response = await apiClient.post("/brands", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      navigate("/brands");
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Brand, // response type
    AxiosError<ApiErrorResponse>, // error type
    { id: number } & CreateBrandPayload // payload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/brands/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["brand", id] });
      navigate("/brands");
    },
  });
};


export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/brands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};
