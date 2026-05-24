import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { ApiErrorResponse } from "../types/types";
import {
  ProductVariantLocationTypeData,
  ProductVariantLocationTypeBulkData,
  LocationType,
} from "../types/productVariantLocationType";

export const useFetchProductVariantLocationTypes = (variantId: number) => {
  return useQuery<LocationType[], AxiosError>({
    queryKey: ["product-variant-location-types", variantId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/product-variants/${variantId}/location-types`
      );
      return response.data.data;
    },
    enabled: !!variantId,
  });
};

export const useSyncProductVariantLocationTypes = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ApiErrorResponse>,
    { variantId: number; payload: ProductVariantLocationTypeData }
  >({
    mutationFn: async ({ variantId, payload }) => {
      await apiClient.post(
        `/product-variants/${variantId}/location-types`,
        payload
      );
    },
    onSuccess: (_, { variantId }) => {
      queryClient.invalidateQueries({
        queryKey: ["product-variant-location-types", variantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-variants"],
      });
    },
  });
};

export const useBulkAssignProductVariantLocationTypes = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ApiErrorResponse>,
    ProductVariantLocationTypeBulkData
  >({
    mutationFn: async (payload) => {
      await apiClient.post("/product-variant-location-types/bulk", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-variants"],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-variant-location-types"],
      });
    },
  });
};
