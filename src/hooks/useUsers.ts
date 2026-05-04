import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { User } from "../types/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ApiErrorResponse, PaginatedApiResponse, CreateUserPayload } from "../types/types";

interface FetchUsersParams {
  page?: number;
  search?: string;
}

// Fetch All Users
export const useFetchUsers = ({
  page = 1,
  search,
}: FetchUsersParams) => {
  return useQuery<PaginatedApiResponse<User>, AxiosError>({
    queryKey: ["users", page, search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/users", {
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

export const useFetchUser = (id: number) => {
  return useQuery<User, AxiosError>({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<User, AxiosError<ApiErrorResponse>, CreateUserPayload>({
    mutationFn: async (payload: CreateUserPayload) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("email", payload.email);
      if (payload.password) {
        formData.append("password", payload.password);
      }
      formData.append("phone", payload.phone);
      if (payload.photo) {
        formData.append("photo", payload.photo);
      }
      if (payload.business_id) {
        formData.append("business_id", payload.business_id.toString());
      }

      const response = await apiClient.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/users");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    { id: number } & CreateUserPayload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("email", payload.email);
      if (payload.password) {
        formData.append("password", payload.password);
      }
      formData.append("phone", payload.phone);
      formData.append("_method", "PUT");

      if (payload.photo) {
        formData.append("photo", payload.photo);
      }
      if (payload.business_id) {
        formData.append("business_id", payload.business_id.toString());
      }

      const response = await apiClient.post(`/users/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      navigate("/users");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
