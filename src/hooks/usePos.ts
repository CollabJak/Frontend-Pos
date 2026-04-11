import { useQuery, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { 
  fetchPosProductsByLocation, 
  checkoutPos, 
  fetchReceiptByOrderId 
} from "../services/api/posService";
import type { 
  PosProduct, 
  PosCheckoutPayload, 
  PosCheckoutResult, 
  ApiResponse, 
  ApiErrorResponse,
  ReceiptPayload
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
  return useMutation<
    ApiResponse<PosCheckoutResult>,
    AxiosError<ApiErrorResponse>,
    { payload: PosCheckoutPayload; idempotencyKey?: string }
  >({
    mutationFn: ({ payload, idempotencyKey }) => checkoutPos(payload, { idempotencyKey }),
  });
};

export const useFetchReceipt = (orderId: number | null) => {
  return useQuery<ReceiptPayload, AxiosError>({
    queryKey: ["receipt", orderId],
    queryFn: () => fetchReceiptByOrderId(orderId!),
    enabled: !!orderId,
  });
};
