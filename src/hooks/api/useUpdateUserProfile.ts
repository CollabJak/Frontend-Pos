import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../../api/axiosConfig";
import { User } from "../../types/auth";
import { UpdateUserProfilePayload } from "../../types/user";
import { ApiErrorResponse } from "../../types/types";
import { toast } from "react-hot-toast";

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    AxiosError<ApiErrorResponse>,
    { userId: number; payload: UpdateUserProfilePayload }
  >({
    mutationFn: async ({ userId, payload }) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("email", payload.email);
      formData.append("phone", payload.phone);
      formData.append("_method", "PATCH");

      if (payload.photo instanceof File) {
        formData.append("photo", payload.photo);
      }

      const response = await apiClient.post(`/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Gagal memperbarui profil";
      toast.error(errorMessage);
    },
  });
};
