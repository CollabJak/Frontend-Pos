import type { ReceiptItem, ReceiptPayload } from "./receipt";

export interface PosProduct {
  variantId: number;
  productName: string;
  variantName: string;
  displayName: string;
  price: number;
  stock: number;
  categoryId?: number;
  tagline?: string;
  imageUrl?: string;
  description?: string;
  isBestSeller?: boolean;
}

export interface PosCheckoutItemPayload {
  variant_id: number;
  qty: number;
}

export interface PosCheckoutPayload {
  location_id: number;
  items: PosCheckoutItemPayload[];
  payment: {
    payment_method_id: number;
    amount_paid: string;
  };
  device_id?: string;
  expected_total?: string;
  customer_id?: number | null;
}

export interface PosCheckoutResult {
  order_id: number;
  total: number;
  paid: number;
  change: number;
  items: ReceiptItem[];
  receipt: ReceiptPayload;
}

export interface PosShift {
  id: number;
  business_id: number;
  location_id: number;
  user_id: number;
  device_id?: string | null;
  status: "open" | "closed";
  opened_at: string;
  closed_at?: string | null;
  starting_cash: number;
  expected_cash: number;
  actual_cash?: number | null;
  difference?: number | null;
  notes?: string | null;
}

export interface PosShiftCashMovement {
  id: number;
  pos_shift_id: number;
  user_id: number;
  type: "in" | "out";
  amount: number;
  description?: string | null;
  created_at: string;
}
