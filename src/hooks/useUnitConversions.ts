import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { UnitConversions } from "../types/types";
import { PaginatedApiResponse, UnitConversionFormData, ApiErrorResponse } from "../types/types";
import { useNavigate } from "react-router";

interface fetchUnitConversionParams {
  page?: number;
  search?: string;
}

export const useFetchUnitConversions = ({
  page = 1,
  search,
}: fetchUnitConversionParams) => {
  return useQuery<PaginatedApiResponse<UnitConversions>, AxiosError>({
    queryKey: ["unit-conversions", page, search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/unit-conversions", {
        params: {
          page,
          ...(search ? { search } : {}),
        },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchUnitConversion = (id: number) => {
  return useQuery<UnitConversions, AxiosError>({
    queryKey: ["unit-conversions", id],
    queryFn: async () => {
      const response = await apiClient.get(`/unit-conversions/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Prevent fetching when id is undefined
  });
};

export const useCreateUnitConversion = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<UnitConversions, AxiosError<ApiErrorResponse>, UnitConversionFormData>({
    mutationFn: async (payload: UnitConversionFormData) => {
      const response = await apiClient.post("/unit-conversions", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["async-options"] });
      navigate("/units?tab=conversions");
    },
  });
};

export const useUpdateUnitConversion = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    UnitConversions, // response type
    AxiosError<ApiErrorResponse>, // error type
    { id: number } & UnitConversionFormData // payload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/unit-conversions/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["unit-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["unit-conversions", id] });
      queryClient.invalidateQueries({ queryKey: ["async-options"] });
      navigate("/units?tab=conversions");
    },
  });
};


export const useDeleteUnitConversion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/unit-conversions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["async-options"] });
    },
  });
};
