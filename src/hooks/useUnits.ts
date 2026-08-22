import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { Units } from "../types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ApiErrorResponse, PaginatedApiResponse, CreateUnitPayload } from "../types/types";
import { DOMAINS, invalidateDomain } from "../constants/queryKeys";

interface fetchUnitsParams {
  page?: number;
  search?: string;
}

// Fetch All Units
export const useFetchUnits = ({
  page = 1,
  search,
}: fetchUnitsParams) => {
  return useQuery<PaginatedApiResponse<Units>, AxiosError>({
    queryKey: ["units", page, search ?? ""],
    queryFn: async () => {
      const response = await apiClient.get("/units", {
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
      invalidateDomain(queryClient, DOMAINS.UNITS);
      navigate("/units?tab=units");
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
      invalidateDomain(queryClient, DOMAINS.UNITS, id);
      navigate("/units?tab=units");
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
      invalidateDomain(queryClient, DOMAINS.UNITS);
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

