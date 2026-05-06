import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/axiosConfig";
import { AxiosError } from "axios";
import { ApiErrorResponse, Role } from "../types/types";
import { AssignRoleFormData } from "../Schemas/userRoleSchema";

export const useFetchUserRoles = (userId: number) => {
  return useQuery<{ user_id: number; roles: Role[] }, AxiosError>({
    queryKey: ["user-roles", userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}/roles`);
      return response.data.data;
    },
    enabled: !!userId,
  });
};

export const useFetchAssignableRoleOptions = () => {
  return useQuery<Role[], AxiosError>({
    queryKey: ["assignable-roles"],
    queryFn: async () => {
      const response = await apiClient.get("/options/assignable-roles");
      return response.data.data;
    },
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<ApiErrorResponse>, AssignRoleFormData>({
    mutationFn: async (payload: AssignRoleFormData) => {
      const response = await apiClient.post("/users/roles", payload);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ["user-roles", variables.user_id] });
    },
  });
};
