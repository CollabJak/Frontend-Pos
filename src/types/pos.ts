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
  device_id?: string;
}
