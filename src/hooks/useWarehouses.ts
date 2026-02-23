import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { Warehouse } from "../types/types";
import { PaginatedApiResponse, CreateWarehousePayload, ApiErrorResponse } from "../types/types";
import { useNavigate } from "react-router";

interface fetchUnitsParams {
  page?: number;
}

export const useFetchWarehouses = ({
  page = 1,
}: fetchUnitsParams) => {
  return useQuery<PaginatedApiResponse<Warehouse>, AxiosError>({
    queryKey: ["warehouses", page],
    queryFn: async () => {
      const response = await apiClient.get("/warehouses", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchWarehouse = (id: number) => {
  return useQuery<Warehouse, AxiosError>({
    queryKey: ["warehouse", id],
    queryFn: async () => {
      const response = await apiClient.get(`/warehouses/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Prevent fetching when id is undefined
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Warehouse, AxiosError<ApiErrorResponse>, CreateWarehousePayload>({
    mutationFn: async (payload: CreateWarehousePayload) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("address", payload.address);
      formData.append("phone", payload.phone);

      if (payload.photo instanceof File) {
        formData.append("photo", payload.photo);
      }

      const response = await apiClient.post("/warehouses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      navigate("/warehouses");
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Warehouse, // response type
    AxiosError<ApiErrorResponse>, // error type
    { id: number } & CreateWarehousePayload // payload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("address", payload.address);
      formData.append("phone", payload.phone);
      formData.append("_method", "PUT");

      if (payload.photo instanceof File) {
        formData.append("photo", payload.photo);
      }

      const response = await apiClient.post(`/warehouses/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse", id] });
      navigate("/warehouses");
    },
  });
};


export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/warehouses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
};
