import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { 
  fetchPosProductsByLocation, 
  checkoutPos, 
  fetchReceiptByOrderId,
  calculatePosCart,
  fetchActivePosShift,
  openPosShift,
  addPosShiftCashMovement,
  closePosShift,
  type PosCalculateCartResult,
  type PosCalculateCartPayload,
  type OpenPosShiftPayload,
  type AddCashMovementPayload,
  type ClosePosShiftPayload
} from "../services/api/posService";
import type { 
  PosProduct, 
  PosCheckoutPayload, 
  PosCheckoutResult, 
  ApiResponse, 
  ApiErrorResponse,
  ReceiptPayload,
  PosShift,
  PosShiftCashMovement
} from "../types/types";

export const useFetchPosProducts = (
  locationId: number, 
  categoryId?: number | null, 
  search?: string
) => {
  return useQuery<PosProduct[], AxiosError>({
    queryKey: ["pos-products", locationId, categoryId, search],
    queryFn: () => fetchPosProductsByLocation(locationId, categoryId, search),
    enabled: !!locationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePosCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PosCheckoutResult>,
    AxiosError<ApiErrorResponse>,
    { payload: PosCheckoutPayload; idempotencyKey?: string }
  >({
    mutationFn: ({ payload, idempotencyKey }) => checkoutPos(payload, { idempotencyKey }),
    onSuccess: (_, variables) => {
      const locationId = variables.payload.location_id;
      // Invalidate product cache to refresh stock data
      queryClient.invalidateQueries({ queryKey: ["pos-products", locationId] });
      // Invalidate active shift to refresh expected cash
      queryClient.invalidateQueries({ queryKey: ["pos-active-shift", locationId] });
    },
  });
};

export const useCalculatePosCart = () => {
  return useMutation<
    ApiResponse<PosCalculateCartResult>,
    AxiosError<ApiErrorResponse>,
    { payload: PosCalculateCartPayload }
  >({
    mutationFn: ({ payload }) => calculatePosCart(payload),
  });
};

export const useFetchReceipt = (orderId: number | null) => {
  return useQuery<ReceiptPayload, AxiosError>({
    queryKey: ["receipt", orderId],
    queryFn: () => fetchReceiptByOrderId(orderId!),
    enabled: !!orderId,
  });
};

export const useFetchActivePosShift = (locationId: number) => {
  return useQuery<ApiResponse<PosShift | null>, AxiosError<ApiErrorResponse>>({
    queryKey: ["pos-active-shift", locationId],
    queryFn: () => fetchActivePosShift(locationId),
    enabled: !!locationId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useOpenPosShift = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PosShift>,
    AxiosError<ApiErrorResponse>,
    { payload: OpenPosShiftPayload }
  >({
    mutationFn: ({ payload }) => openPosShift(payload),
    onSuccess: (data) => {
      const locationId = data.data?.location_id;
      if (locationId) {
        queryClient.invalidateQueries({ queryKey: ["pos-active-shift", locationId] });
      }
    },
  });
};

export const useAddPosShiftCashMovement = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PosShiftCashMovement>,
    AxiosError<ApiErrorResponse>,
    { payload: AddCashMovementPayload; locationId: number }
  >({
    mutationFn: ({ payload }) => addPosShiftCashMovement(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pos-active-shift", variables.locationId] });
    },
  });
};

export const useClosePosShift = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PosShift>,
    AxiosError<ApiErrorResponse>,
    { shiftId: number; payload: ClosePosShiftPayload; locationId: number }
  >({
    mutationFn: ({ shiftId, payload }) => closePosShift(shiftId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pos-active-shift", variables.locationId] });
    },
  });
};
