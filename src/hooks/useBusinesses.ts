import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import apiClient from "../api/axiosConfig";
import { ApiErrorResponse, Business, CreateBusinessPayload, PaginatedApiResponse, UpdateBusinessPayload } from "../types/types";

interface FetchBusinessesParams {
  page?: number;
}

const normalizePayload = (payload: CreateBusinessPayload | UpdateBusinessPayload) => ({
  ...payload,
  phone: typeof payload.phone === "string" ? payload.phone.trim() : payload.phone,
  address: typeof payload.address === "string" ? payload.address.trim() : payload.address,
});

export const useFetchBusinesses = ({ page = 1 }: FetchBusinessesParams) => {
  return useQuery<PaginatedApiResponse<Business>, AxiosError>({
    queryKey: ["businesses", page],
    queryFn: async () => {
      const response = await apiClient.get("/businesses", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchBusiness = (id: number) => {
  return useQuery<Business, AxiosError>({
    queryKey: ["business", id],
    queryFn: async () => {
      const response = await apiClient.get(`/businesses/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Business, AxiosError<ApiErrorResponse>, CreateBusinessPayload & { isFirstSetup?: boolean }>({
    mutationFn: async ({ isFirstSetup: _flag, ...payload }) => {
      const response = await apiClient.post("/businesses", normalizePayload(payload as CreateBusinessPayload));
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      if (variables.isFirstSetup) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/businesses");
      }
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Business,
    AxiosError<ApiErrorResponse>,
    { id: number } & UpdateBusinessPayload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/businesses/${id}`, normalizePayload(payload));
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business", id] });
      navigate("/businesses");
    },
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/businesses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
};
