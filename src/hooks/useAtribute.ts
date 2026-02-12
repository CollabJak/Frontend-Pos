import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { Atribute } from "../types/types";
import { PaginatedApiResponse, CreateAtributePayload, ApiErrorResponse } from "../types/types";
import { useNavigate } from "react-router";

interface fetchAtributesParams {
  page?: number;
}

export const useFetchAtributes = ({
  page = 1,
}: fetchAtributesParams) => {
  return useQuery<PaginatedApiResponse<Atribute>, AxiosError>({
    queryKey: ["atributes", page],
    queryFn: async () => {
      const response = await apiClient.get("/atribute", {
        params: { page },
      });

      return response.data.data;
    },
    keepPreviousData: true,
  });
};

export const useFetchAtribute = (id: number) => {
  return useQuery<Atribute, AxiosError>({
    queryKey: ["atribute", id],
    queryFn: async () => {
      const response = await apiClient.get(`/atribute/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Prevent fetching when id is undefined
  });
};

export const useCreateAtribute = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Atribute, AxiosError<ApiErrorResponse>, CreateAtributePayload>({
    mutationFn: async (payload: CreateAtributePayload) => {
      const response = await apiClient.post("/atribute", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atribute"] });
      navigate("/atributes");
    },
  });
};

export const useUpdateAtribute = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Atribute, // response type
    AxiosError<ApiErrorResponse>, // error type
    { id: number } & CreateAtributePayload // payload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/atribute/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["atributes"] });
      queryClient.invalidateQueries({ queryKey: ["atribute", id] });
      navigate("/atributes");
    },
  });
};


export const useDeleteAtribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/atribute/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atributes"] });
    },
  });
};
