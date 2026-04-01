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

export interface PosCheckoutReceiptItem {
  variant_id: number;
  qty: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

export interface PosCheckoutResult {
  order_id: number;
  total: number;
  paid: number;
  change: number;
  items: PosCheckoutReceiptItem[];
  receipt: {
    order_number?: string;
    order_status?: string;
    payment_status?: string;
    payment_method?: string;
    paid_at?: string | null;
    location_id?: number;
    cashier_id?: number;
  };
}
