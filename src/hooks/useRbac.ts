import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Role,
  Permission,
  UpsertRolePayload,
  SyncPermissionsPayload,
  ApiErrorResponse,
  PaginatedApiResponse
} from "../types/types";

// --- Roles ---

export const useFetchRoles = () => {
  return useQuery<Role[], AxiosError>({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await apiClient.get("/roles");
      return response.data.data;
    },
  });
};

export const useUpsertRole = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Role,
    AxiosError<ApiErrorResponse>,
    { id?: number; data: UpsertRolePayload }
  >({
    mutationFn: async ({ id, data }) => {
      const response = id
        ? await apiClient.put(`/roles/${id}`, data)
        : await apiClient.post("/roles", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

// --- Permissions ---

export const useFetchPermissions = ({ page = 1 }: { page?: number } = {}) => {
  return useQuery<PaginatedApiResponse<Permission>, AxiosError>({
    queryKey: ["permissions", page],
    queryFn: async () => {
      const response = await apiClient.get(`/permissions?page=${page}`);
      return response.data.data;
    },
  });
};

export const useFetchPermissionOptions = () => {
  return useQuery<Permission[], AxiosError>({
    queryKey: ["permission-options"],
    queryFn: async () => {
      const response = await apiClient.get("/options/permissions");
      return response.data.data;
    },
  });
};

export const useSyncPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ApiErrorResponse>,
    { roleId: number; payload: SyncPermissionsPayload }
  >({
    mutationFn: async ({ roleId, payload }) => {
      await apiClient.put(`/roles/${roleId}/permissions`, payload);
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpsertPermission = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Permission,
    AxiosError<ApiErrorResponse>,
    { id?: number; data: { name: string; guard_name?: string } }
  >({
    mutationFn: async ({ id, data }) => {
      const response = id
        ? await apiClient.put(`/permissions/${id}`, data)
        : await apiClient.post("/permissions", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/permissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};
