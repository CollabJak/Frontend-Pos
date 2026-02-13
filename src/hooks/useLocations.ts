import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import {
  ApiErrorResponse,
  Location,
  LocationFormData,
  PaginatedApiResponse,
} from "../types/types";

interface FetchLocationsParams {
  page?: number;
}

export const useFetchLocations = ({ page = 1 }: FetchLocationsParams) => {
  return useQuery<PaginatedApiResponse<Location>, AxiosError>({
    queryKey: ["locations", page],
    queryFn: async () => {
      const response = await apiClient.get("/locations", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchLocation = (id: number) => {
  return useQuery<Location, AxiosError>({
    queryKey: ["location", id],
    queryFn: async () => {
      const response = await apiClient.get(`/locations/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Location, AxiosError<ApiErrorResponse>, LocationFormData>({
    mutationFn: async (payload: LocationFormData) => {
      const response = await apiClient.post("/locations", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      navigate("/locations");
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Location,
    AxiosError<ApiErrorResponse>,
    { id: number } & LocationFormData
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/locations/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["location", id] });
      navigate("/locations");
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};
