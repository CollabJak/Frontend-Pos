import apiClient from "../../api/axiosConfig";
import type { ApiResponse, PosCheckoutPayload, PosCheckoutResult, PosProduct } from "../../types/types";

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

  return {
    variantId,
    productName,
    variantName,
    displayName: `${productName} - ${variantName}`,
    price,
    stock,
  };
};

export const fetchPosProductsByLocation = async (locationId: number): Promise<PosProduct[]> => {
  const response = await apiClient.get<ApiResponse<unknown>>("/pos/products", {
    params: { location_id: locationId },
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
