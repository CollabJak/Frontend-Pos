import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { User, ApiErrorResponse, PaginatedApiResponse, CreateUserPayload, Location } from "../types/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DOMAINS, invalidateDomain } from "../constants/queryKeys";
import { UserFormData } from "../Schemas/userSchema";

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
      invalidateDomain(queryClient, DOMAINS.USERS);
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
      invalidateDomain(queryClient, DOMAINS.USERS, id);
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
      invalidateDomain(queryClient, DOMAINS.USERS);
    },
  });
};

export const useCreateUserWithLocations = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<User, AxiosError<ApiErrorResponse>, UserFormData>({
    mutationFn: async (payload) => {
      const userPayload: CreateUserPayload = {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        photo: payload.photo,
        business_id: payload.business_id,
      };

      const formData = new FormData();
      formData.append("name", userPayload.name);
      formData.append("email", userPayload.email);
      if (userPayload.password) {
        formData.append("password", userPayload.password);
      }
      formData.append("phone", userPayload.phone);
      if (userPayload.photo) {
        formData.append("photo", userPayload.photo);
      }
      if (userPayload.business_id) {
        formData.append("business_id", userPayload.business_id.toString());
      }

      const createResponse = await apiClient.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newUser = createResponse.data.data;

      const locationPayload = {
        location_ids: payload.location_ids,
        primary_location_id: payload.primary_location_id,
      };

      await apiClient.put(`/users/${newUser.id}/locations`, locationPayload);

      return newUser;
    },
    onSuccess: () => {
      invalidateDomain(queryClient, DOMAINS.USERS);
      navigate("/users");
    },
  });
};

export const useFetchUserLocations = (userId: number) => {
  return useQuery<Location[], AxiosError>({
    queryKey: ["user-locations", userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}/locations`);
      return response.data.data;
    },
    enabled: !!userId,
  });
};

export const useSyncUserLocations = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Location[],
    AxiosError<ApiErrorResponse>,
    { userId: number; location_ids: number[]; primary_location_id: number }
  >({
    mutationFn: async ({ userId, location_ids, primary_location_id }) => {
      const response = await apiClient.put(`/users/${userId}/locations`, {
        location_ids,
        primary_location_id,
      });
      return response.data.data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-locations", userId] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};
