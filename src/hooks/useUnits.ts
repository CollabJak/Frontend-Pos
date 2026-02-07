import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { Units } from "../types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ApiErrorResponse, PaginatedApiResponse, CreateUnitPayload } from "../types/types";

interface fetchUnitsParams {
  page?: number;
}

// Fetch All Units
export const useFetchUnits = ({
  page = 1,
}: fetchUnitsParams) => {
  return useQuery<PaginatedApiResponse<Units>, AxiosError>({
    queryKey: ["units", page],
    queryFn: async () => {
      const response = await apiClient.get("/units", {
        params: { page },
      });

      return response.data.data;
    },
    keepPreviousData: true,
  });
};

export const useFetchUnit = (id: number) => {
  return useQuery<Units, AxiosError>({
    queryKey: ["unit", id],
    queryFn: async () => {
      const response = await apiClient.get(`/units/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Prevent fetching when id is undefined
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Units, AxiosError<ApiErrorResponse>, CreateUnitPayload>({
    mutationFn: async (payload: CreateUnitPayload) => {
      const response = await apiClient.post("/units", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      navigate("/units");
    },
  });
};

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<
    Units, // response type
    AxiosError<ApiErrorResponse>, // error type
    { id: number } & CreateUnitPayload // payload
  >({
    mutationFn: async ({ id, ...payload }) => {
      const response = await apiClient.put(`/units/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["unit", id] });
      navigate("/units");
    },
  });
};


export const useDeleteUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
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

