import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { Categories } from "../types/types";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ApiErrorResponse, PaginatedApiResponse, CreateCategoryPayload } from "../types/types";

interface FetchCategoriesParams {
  page?: number;
}

// Fetch All Categories
export const useFetchCategories = ({
  page = 1,
}: FetchCategoriesParams) => {
  return useQuery<PaginatedApiResponse<Categories>, AxiosError>({
    queryKey: ["categories", page],
    queryFn: async () => {
      const response = await apiClient.get("/categories", {
        params: { page },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useFetchCategory = (id: number) => {
  return useQuery<Categories, AxiosError>({
    queryKey: ["category", id],
    queryFn: async () => {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Prevent fetching when id is undefined
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<CreateCategoryPayload, AxiosError<ApiErrorResponse>, CreateCategoryPayload>({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      if(payload.tagline) {
        formData.append("tagline", payload.tagline);
      }
      formData.append("require_expiry", payload.require_expiry ? "1" : "0");
      formData.append("require_batch", payload.require_batch ? "1" : "0");
      formData.append("default_picking_strategy", payload.default_picking_strategy);
      if(payload.photo) {
        formData.append("photo", payload.photo);
      }

      const response = await apiClient.post("/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },

      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      navigate("/categories");

    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Categories, // response type
    AxiosError<ApiErrorResponse>, // error type
    { id: number } & CreateCategoryPayload // payload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      if(payload.tagline) {
        formData.append("tagline", payload.tagline);
      }
      formData.append("require_expiry", payload.require_expiry ? "1" : "0");
      formData.append("require_batch", payload.require_batch ? "1" : "0");
      formData.append("default_picking_strategy", payload.default_picking_strategy);
      formData.append("_method", "PUT");

      if (payload.photo) {
        formData.append("photo", payload.photo);
      }

      const response = await apiClient.post(`/categories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      navigate("/categories");

    },
  });
};


export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// // Download Category Import Template
// export const useDownloadCategoryTemplate = () => {
//   return useMutation({
//     mutationFn: async () => {
//       const response = await apiClient.get('/categories/template/download', {
//         responseType: 'blob',
//       });
//       return response.data;
//     },
//   });
// };

// // Import Categories from Excel
// export const useImportCategories = () => {
//   const queryClient = useQueryClient();

//   return useMutation<
//     ImportResult,
//     AxiosError<ApiErrorResponse>,
//     File
//   >({
//     mutationFn: async (file: File) => {
//       const formData = new FormData();
//       formData.append('file', file);

//       const response = await apiClient.post('/categories/import', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       return response.data.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['categories'] });
//     },
//   });
// };

