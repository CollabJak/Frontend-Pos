import apiClient from "../../api/axiosConfig";
import type { ApiResponse, PosCheckoutPayload, PosCheckoutResult, PosProduct, ReceiptPayload, PosShift, PosShiftCashMovement } from "../../types/types";

interface RawPosProduct {
  variant_id?: number | string;
  product_variant_id?: number | string;
  id?: number | string;
  product_name?: string;
  variant_name?: string;
  name?: string;
  price?: number | string;
  stock?: number | string;
  available_stock?: number | string;
  available?: number | string;
  image_url?: string;
  imageUrl?: string;
  category_id?: number | string;
  categoryId?: number | string;
  tagline?: string;
  description?: string;
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const firstText = (...values: Array<unknown>): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
};

const extractRows = (payload: unknown): RawPosProduct[] => {
  if (Array.isArray(payload)) {
    return payload as RawPosProduct[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const rows = (payload as { data?: unknown }).data;
    if (Array.isArray(rows)) {
      return rows as RawPosProduct[];
    }
  }

  return [];
};

const mapProduct = (row: RawPosProduct): PosProduct | null => {
  const variantId = toPositiveInt(row.variant_id ?? row.product_variant_id ?? row.id);
  const productName = firstText(row.product_name);
  const variantName = firstText(row.variant_name, row.name);

  if (variantId === null || productName.length === 0 || variantName.length === 0) {
    return null;
  }

  const price = Math.max(0, toNumber(row.price));
  const stock = Math.max(0, Math.floor(toNumber(row.stock ?? row.available_stock ?? row.available)));
  const categoryId = toPositiveInt(row.categoryId ?? row.category_id);

  return {
    variantId,
    productName,
    variantName,
    displayName: `${productName} - ${variantName}`,
    price,
    stock,
    categoryId: categoryId ?? undefined,
    tagline: firstText(row.tagline) || undefined,
    imageUrl: row.imageUrl ?? row.image_url,
    description: firstText(row.description) || undefined,
    isBestSeller: false, // TODO: Source from backend when best_seller field is added
  };
};

export const fetchPosProductsByLocation = async (
  locationId: number,
  categoryId?: number | null,
  search?: string
): Promise<PosProduct[]> => {
  const response = await apiClient.get<ApiResponse<unknown>>("/pos/products", {
    params: {
      location_id: locationId,
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(search ? { search: search.trim() } : {}),
    },
  });

  return extractRows(response.data.data)
    .map(mapProduct)
    .filter((item): item is PosProduct => item !== null);
};

interface CheckoutPosOptions {
  idempotencyKey?: string;
}

export const checkoutPos = async (
  payload: PosCheckoutPayload,
  options: CheckoutPosOptions = {}
): Promise<ApiResponse<PosCheckoutResult>> => {
  const headers: Record<string, string> = {};
  if (typeof options.idempotencyKey === "string" && options.idempotencyKey.trim().length > 0) {
    headers["X-Idempotency-Key"] = options.idempotencyKey.trim();
  }

  const response = await apiClient.post<ApiResponse<PosCheckoutResult>>("/pos/checkout", payload, { headers });
  return response.data;
};

export interface PosCalculateCartPayload {
  location_id: number;
  items: Array<{ variant_id: number; qty: number }>;
  customer_group_id?: number | null;
  customer_id?: number | null;
  channel?: string;
}

export interface PosCalculateCartResult {
  items: Array<{
    variant_id: number;
    qty: number;
    base_price: number;
    discount: number;
    tax: number;
    final_unit_price: number;
    final_total_price: number;
    applied_promotions: number[];
    applied_tier: number | null;
  }>;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  grand_total: number;
}

export const calculatePosCart = async (
  payload: PosCalculateCartPayload
): Promise<ApiResponse<PosCalculateCartResult>> => {
  const response = await apiClient.post<ApiResponse<PosCalculateCartResult>>("/pos/calculate-cart", payload);
  return response.data;
};

export const fetchReceiptByOrderId = async (orderId: number): Promise<ReceiptPayload> => {
  const response = await apiClient.get<ApiResponse<ReceiptPayload>>(`/receipt/${orderId}`);
  if (!response.data.data) {
    throw new Error("Receipt payload is empty");
  }

  return response.data.data;
};

export interface OpenPosShiftPayload {
  location_id: number;
  starting_cash: string | number;
  notes?: string | null;
}

export interface AddCashMovementPayload {
  pos_shift_id: number;
  type: "in" | "out";
  amount: string | number;
  description?: string | null;
}

export interface ClosePosShiftPayload {
  actual_cash: string | number;
  notes?: string | null;
}

export const fetchActivePosShift = async (locationId: number): Promise<ApiResponse<PosShift | null>> => {
  const response = await apiClient.get<ApiResponse<PosShift | null>>("/pos/shifts/active", {
    params: { location_id: locationId },
  });
  return response.data;
};

export const openPosShift = async (payload: OpenPosShiftPayload): Promise<ApiResponse<PosShift>> => {
  const response = await apiClient.post<ApiResponse<PosShift>>("/pos/shifts/open", {
    ...payload,
    starting_cash: String(payload.starting_cash),
  });
  return response.data;
};

export const addPosShiftCashMovement = async (payload: AddCashMovementPayload): Promise<ApiResponse<PosShiftCashMovement>> => {
  const response = await apiClient.post<ApiResponse<PosShiftCashMovement>>("/pos/shifts/cash-movement", {
    ...payload,
    amount: String(payload.amount),
  });
  return response.data;
};

export const closePosShift = async (shiftId: number, payload: ClosePosShiftPayload): Promise<ApiResponse<PosShift>> => {
  const response = await apiClient.post<ApiResponse<PosShift>>(`/pos/shifts/${shiftId}/close`, {
    ...payload,
    actual_cash: String(payload.actual_cash),
  });
  return response.data;
};
