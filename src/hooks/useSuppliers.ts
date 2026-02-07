import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { Supplier } from "../types/types";
import { PaginatedApiResponse, CreateSupplierPayload, ApiErrorResponse } from "../types/types";
import { useNavigate } from "react-router";

interface fetchUnitsParams {
  page?: number;
}

export const useFetchSuppliers = ({
  page = 1,
}: fetchUnitsParams) => {
  return useQuery<PaginatedApiResponse<Supplier>, AxiosError>({
    queryKey: ["suppliers", page],
    queryFn: async () => {
      const response = await apiClient.get("/suppliers", {
        params: { page },
      });

      return response.data.data;
    },
    keepPreviousData: true,
  });
};

export const useFetchSupplier = (id: number) => {
  return useQuery<Supplier, AxiosError>({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const response = await apiClient.get(`/suppliers/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Prevent fetching when id is undefined
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Supplier, AxiosError<ApiErrorResponse>, CreateSupplierPayload>({
    mutationFn: async (payload: CreateSupplierPayload) => {
      const response = await apiClient.post("/suppliers", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      navigate("/suppliers");
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Supplier, // response type
    AxiosError<ApiErrorResponse>, // error type
    { id: number } & CreateSupplierPayload // payload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/suppliers/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", id] });
      navigate("/suppliers");
    },
  });
};


export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};
