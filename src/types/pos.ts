import type { ReceiptItem, ReceiptPayload } from "./receipt";

export interface PosProduct {
  variantId: number;
  productName: string;
  variantName: string;
  displayName: string;
  price: number;
  stock: number;
}

export interface PosCheckoutItemPayload {
  variant_id: number;
  qty: number;
}

export interface PosCheckoutPayload {
  location_id: number;
  items: PosCheckoutItemPayload[];
  payment: {
    method: "cash" | "card" | "qris";
    amount_paid: string;
  };
  device_id?: string;
}

export interface PosCheckoutResult {
  order_id: number;
  total: number;
  paid: number;
  change: number;
  items: ReceiptItem[];
  receipt: ReceiptPayload;
}
