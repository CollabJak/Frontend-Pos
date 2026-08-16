import apiClient from "../../api/axiosConfig";
import type {
  InventoryAdjustmentPayload,
  InventoryBatch,
  InventoryDetail,
  InventoryListItem,
  InventoryMovementItem,
  InventorySummary,
  PaginatedApiResponse,
} from "../../types/types";

interface InventoryListParams {
  page?: number;
  search?: string;
  locationId?: number | null;
  locationType?: string | null;
}

interface InventoryBatchesParams {
  variantId: number;
  page?: number;
}

interface InventoryMovementsParams {
  page?: number;
  product?: string;
  locationId?: number | null;
  dateFrom?: string;
  dateTo?: string;
  movementType?: string;
}

export const fetchInventoryList = async ({
  page = 1,
  search,
  locationId,
  locationType,
}: InventoryListParams): Promise<PaginatedApiResponse<InventoryListItem>> => {
  const response = await apiClient.get("/inventory", {
    params: {
      page,
      ...(search ? { search } : {}),
      ...(locationId ? { location_id: locationId } : {}),
      ...(locationType ? { location_type: locationType } : {}),
    },
  });

  return response.data.data;
};

export const fetchInventoryDetail = async (variantId: number): Promise<InventoryDetail> => {
  const response = await apiClient.get(`/inventory/${variantId}`);
  return response.data.data;
};

export const fetchInventoryBatches = async ({
  variantId,
  page = 1,
}: InventoryBatchesParams): Promise<PaginatedApiResponse<InventoryBatch>> => {
  const response = await apiClient.get(`/inventory/${variantId}/batches`, {
    params: { page },
  });

  return response.data.data;
};

export const fetchInventoryMovements = async ({
  page = 1,
  product,
  locationId,
  dateFrom,
  dateTo,
  movementType,
}: InventoryMovementsParams): Promise<PaginatedApiResponse<InventoryMovementItem>> => {
  const response = await apiClient.get("/inventory/movements", {
    params: {
      page,
      ...(product ? { product } : {}),
      ...(locationId ? { location_id: locationId } : {}),
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {}),
      ...(movementType ? { movement_type: movementType } : {}),
    },
  });

  return response.data.data;
};

export const submitInventoryAdjustment = async (payload: InventoryAdjustmentPayload): Promise<unknown> => {
  const response = await apiClient.post("/inventory/adjustment", payload);
  return response.data.data;
};

export const fetchInventorySummary = async (): Promise<InventorySummary> => {
  const response = await apiClient.get("/inventory/summary");
  return response.data.data;
};

export const fetchOrphanedStocks = async ({
  page = 1,
  search,
  locationId,
}: InventoryListParams): Promise<PaginatedApiResponse<InventoryListItem>> => {
  const response = await apiClient.get("/inventory/orphaned-stocks", {
    params: {
      page,
      ...(search ? { search } : {}),
      ...(locationId ? { location_id: locationId } : {}),
    },
  });

  return response.data.data;
};
